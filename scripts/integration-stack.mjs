// Brings up the integration backend stack using Testcontainers (the library),
// instead of orchestrating `docker compose` by hand. Testcontainers manages a
// dedicated network, container lifecycle and (via Ryuk) reaping of orphans, so
// a crashed test run can't leave the stack running.
//
// The frontend's Vite dev server proxies /1 and /2 to the API on a fixed host
// port (VITE_API_PROXY_TARGET, default http://localhost:5001), and the tests
// read mail from Mailpit on a fixed host port (default http://localhost:8025),
// so those two containers bind fixed host ports. Postgres, Redis and the Cron
// host are only reached over the internal network, so they need no host ports.
//
// The Cron host is not optional: the API never sends mail itself, it only writes
// an email_outbox row and publishes a Redis nudge. The Cron host is what drains
// that table over SMTP, so without it no activation mail ever reaches Mailpit and
// every test that needs an activated user fails.

import { GenericContainer, Network, Wait } from 'testcontainers';

const API_IMAGE = process.env.INTEGRATION_API_IMAGE ?? 'ghcr.io/openshock/api:develop';
const POSTGRES_IMAGE = process.env.INTEGRATION_POSTGRES_IMAGE ?? 'postgres:16-alpine';
const REDIS_IMAGE = process.env.INTEGRATION_REDIS_IMAGE ?? 'redis/redis-stack-server:latest';
const MAILPIT_IMAGE = process.env.INTEGRATION_MAILPIT_IMAGE ?? 'axllent/mailpit:latest';
const CRON_IMAGE = process.env.INTEGRATION_CRON_IMAGE ?? 'ghcr.io/openshock/cron:develop';

// Fixed host ports the rest of the toolchain expects.
function hostPortFromUrl(url, fallback) {
  try {
    const port = new URL(url).port;
    return port ? Number(port) : fallback;
  } catch {
    return fallback;
  }
}

const API_HOST_PORT = hostPortFromUrl(process.env.VITE_API_PROXY_TARGET, 5001);
const MAILPIT_HOST_PORT = hostPortFromUrl(process.env.TEST_MAILPIT_URL, 8025);

const FRONTEND_URL = process.env.TEST_FRONTEND_URL ?? 'http://localhost:5173';

// Config both hosts need. They are two halves of one mail pipeline: the API writes the
// email_outbox row and nudges Cron over Redis pub/sub, Cron claims the row and delivers it
// over SMTP, building the links in the mail from the frontend base URL. They therefore have
// to agree on the database, Redis, the frontend URL and the mail settings.
const SHARED_ENVIRONMENT = {
  ASPNETCORE_ENVIRONMENT: 'Development',
  OPENSHOCK__DB__CONN:
    'Host=postgres;Port=5432;Database=openshock;Username=openshock;Password=openshock',
  OPENSHOCK__REDIS__HOST: 'redis',
  OPENSHOCK__FRONTEND__SHORTURL: FRONTEND_URL,
  OPENSHOCK__FRONTEND__BASEURL: FRONTEND_URL,
  OPENSHOCK__FRONTEND__COOKIEDOMAIN: 'localhost',
  OPENSHOCK__MAIL__TYPE: 'SMTP',
  OPENSHOCK__MAIL__SENDER__NAME: 'OpenShock Dev',
  OPENSHOCK__MAIL__SENDER__EMAIL: 'dev@openshock.dev',
  OPENSHOCK__MAIL__SMTP__HOST: 'mailpit',
  OPENSHOCK__MAIL__SMTP__PORT: '1025',
  // Mailpit accepts no AUTH by default, and the sender only authenticates when the server
  // advertises it, so these are inert unless Mailpit is configured to require credentials.
  OPENSHOCK__MAIL__SMTP__USERNAME: 'dev',
  OPENSHOCK__MAIL__SMTP__PASSWORD: 'dev',
  OPENSHOCK__MAIL__SMTP__ENABLESSL: 'false',
  OPENSHOCK__MAIL__SMTP__VERIFYCERTIFICATE: 'false',
};

const log = (msg) => process.stdout.write(`[integration-stack] ${msg}\n`);

/**
 * Starts postgres, redis, mailpit, the API and the Cron host on a shared network
 * and waits for each to become ready. Resolves to an object with the started containers
 * and a `stop()` helper that tears the whole stack down.
 */
export async function startStack() {
  log('starting Testcontainers stack ...');
  const network = await new Network().start();

  const postgres = await new GenericContainer(POSTGRES_IMAGE)
    .withNetwork(network)
    .withNetworkAliases('postgres')
    .withEnvironment({
      POSTGRES_DB: 'openshock',
      POSTGRES_USER: 'openshock',
      POSTGRES_PASSWORD: 'openshock',
    })
    .withWaitStrategy(Wait.forLogMessage(/database system is ready to accept connections/, 2))
    .start();
  log('postgres ready');

  const redis = await new GenericContainer(REDIS_IMAGE)
    .withNetwork(network)
    .withNetworkAliases('redis')
    .withWaitStrategy(Wait.forLogMessage(/Ready to accept connections/))
    .start();
  log('redis ready');

  const mailpit = await new GenericContainer(MAILPIT_IMAGE)
    .withNetwork(network)
    .withNetworkAliases('mailpit')
    .withExposedPorts({ container: 8025, host: MAILPIT_HOST_PORT })
    .withWaitStrategy(Wait.forHttp('/', 8025))
    .start();
  log(`mailpit ready (web UI on host port ${MAILPIT_HOST_PORT})`);

  const api = await new GenericContainer(API_IMAGE)
    .withNetwork(network)
    // Kestrel serves plain HTTP on container port 80 (and HTTPS on 443, unused
    // here) — use HTTP directly so nothing in the toolchain has to trust a
    // self-signed cert.
    .withExposedPorts({ container: 80, host: API_HOST_PORT })
    .withEnvironment({
      ...SHARED_ENVIRONMENT,
      OPENSHOCK_DISABLE_RATE_LIMITING: '1',
      OPENSHOCK__TURNSTILE__ENABLED: 'false',
      OPENSHOCK__LCG__COUNTRYCODE: 'DE',
    })
    .withWaitStrategy(
      // Any HTTP response (even 404) on 80 means Kestrel is up and migrations
      // have completed.
      Wait.forHttp('/', 80).forStatusCodeMatching(() => true)
    )
    .withStartupTimeout(Number(process.env.INTEGRATION_API_STARTUP_TIMEOUT_MS ?? 180_000))
    .start();
  log(`api ready (http on host port ${API_HOST_PORT})`);

  // Started after the API because the API is the sole migrator: the Cron host does not migrate
  // and blocks on `WaitForOpenShockSchemaReady` before it serves anything, so it would just sit
  // there until the API had finished. Nothing outside the network talks to it, so it binds no
  // fixed host port - port 80 is exposed only so the readiness probe below can reach it.
  const cron = await new GenericContainer(CRON_IMAGE)
    .withNetwork(network)
    .withNetworkAliases('cron')
    .withExposedPorts(80)
    .withEnvironment({
      ...SHARED_ENVIRONMENT,
      // Hangfire workers pick enqueued jobs off the queue table by polling, every 15s by default.
      // The Redis nudge the API publishes on write is what makes delivery prompt, but it still has
      // to wait for that poll, which would put a signup's activation mail up to 15s away - more
      // than a test wants to spend waiting. One second keeps delivery effectively immediate.
      OPENSHOCK__HANGFIRE__QUEUEPOLLINTERVAL: '00:00:01',
    })
    .withWaitStrategy(
      // Cron serves its Hangfire dashboard once it is up; `/` itself is a 404, and any reply means
      // the host is running, which (given the block above) also means the schema is ready.
      Wait.forHttp('/', 80).forStatusCodeMatching(() => true)
    )
    .withStartupTimeout(Number(process.env.INTEGRATION_CRON_STARTUP_TIMEOUT_MS ?? 180_000))
    .start();
  log('cron ready (email outbox delivery running)');

  const stop = async () => {
    log('stopping stack ...');
    // Stop the hosts first so they stop talking to their dependencies.
    await Promise.all([api.stop().catch(() => {}), cron.stop().catch(() => {})]);
    await Promise.all([
      mailpit.stop().catch(() => {}),
      redis.stop().catch(() => {}),
      postgres.stop().catch(() => {}),
    ]);
    await network.stop().catch(() => {});
    log('stack stopped');
  };

  return { network, postgres, redis, mailpit, api, cron, stop };
}

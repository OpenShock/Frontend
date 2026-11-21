// Brings up the integration backend stack using Testcontainers (the library),
// instead of orchestrating `docker compose` by hand. Testcontainers manages a
// dedicated network, container lifecycle and (via Ryuk) reaping of orphans, so
// a crashed test run can't leave the stack running.
//
// The frontend's Vite dev server proxies /1 and /2 to the API on a fixed host
// port (VITE_API_PROXY_TARGET, default http://localhost:5001), and the tests
// read mail from Mailpit on a fixed host port (default http://localhost:8025),
// so those two containers bind fixed host ports. Postgres, Dragonfly and the Cron
// host are only reached over the internal network, so they need no host ports.
//
// Postgres and Dragonfly are the images the API's own docker-compose.yml deploys, so the
// suite runs against the same data stores production does.
//
// The Cron host is not optional: the API never sends mail itself, it only writes
// an email_outbox row and publishes a Redis pub/sub nudge. The Cron host is what drains
// that table over SMTP, so without it no activation mail ever reaches Mailpit and
// every test that needs an activated user fails.

import { GenericContainer, Network, Wait } from 'testcontainers';

const API_IMAGE = process.env.INTEGRATION_API_IMAGE ?? 'ghcr.io/openshock/api:develop';
const POSTGRES_IMAGE = process.env.INTEGRATION_POSTGRES_IMAGE ?? 'postgres:18';
const DRAGONFLY_IMAGE =
  process.env.INTEGRATION_DRAGONFLY_IMAGE ?? 'ghcr.io/dragonflydb/dragonfly:latest';
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
// to agree on the database, Dragonfly, the frontend URL and the mail settings.
const SHARED_ENVIRONMENT = {
  ASPNETCORE_ENVIRONMENT: 'Development',
  OPENSHOCK__DB__CONN:
    'Host=postgres;Port=5432;Database=openshock;Username=openshock;Password=openshock',
  OPENSHOCK__REDIS__HOST: 'dragonfly',
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
 * Starts postgres, dragonfly, mailpit, the API and the Cron host on a shared network
 * and waits for each to become ready. Resolves to an object with the started containers
 * and a `stop()` helper that tears the whole stack down.
 */
export async function startStack() {
  log('starting Testcontainers stack ...');

  // Everything started so far. If a later container fails to come up, these are stopped
  // right away instead of being left for Ryuk: until Ryuk gets to them they keep the fixed
  // host ports, and an immediate retry dies on "port is already allocated".
  const started = [];
  try {
    return await startContainers(started);
  } catch (err) {
    log('startup failed, stopping what was already started ...');
    for (const resource of started.reverse()) {
      await resource.stop().catch(() => {});
    }
    throw err;
  }
}

async function startContainers(started) {
  const track = (resource) => {
    started.push(resource);
    return resource;
  };

  const network = track(await new Network().start());

  const postgres = await new GenericContainer(POSTGRES_IMAGE)
    .withNetwork(network)
    .withNetworkAliases('postgres')
    .withEnvironment({
      POSTGRES_DB: 'openshock',
      POSTGRES_USER: 'openshock',
      POSTGRES_PASSWORD: 'openshock',
    })
    .withWaitStrategy(Wait.forLogMessage(/database system is ready to accept connections/, 2))
    .start()
    .then(track);
  log('postgres ready');

  // Redis-compatible store. `Ex` makes it emit expired-key events, which the API subscribes
  // to. Nothing outside the network talks to it; the port is exposed only so the default
  // wait strategy (listening ports) has something to probe.
  const dragonfly = await new GenericContainer(DRAGONFLY_IMAGE)
    .withNetwork(network)
    .withNetworkAliases('dragonfly')
    .withCommand(['--notify_keyspace_events=Ex'])
    .withExposedPorts(6379)
    .start()
    .then(track);
  log('dragonfly ready');

  const mailpit = await new GenericContainer(MAILPIT_IMAGE)
    .withNetwork(network)
    .withNetworkAliases('mailpit')
    .withExposedPorts({ container: 8025, host: MAILPIT_HOST_PORT })
    .withWaitStrategy(Wait.forHttp('/', 8025))
    .start()
    .then(track);
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
    .start()
    .then(track);
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
    .start()
    .then(track);
  log('cron ready (email outbox delivery running)');

  const stop = async () => {
    log('stopping stack ...');
    // Stop the hosts first so they stop talking to their dependencies.
    await Promise.all([api.stop().catch(() => {}), cron.stop().catch(() => {})]);
    await Promise.all([
      mailpit.stop().catch(() => {}),
      dragonfly.stop().catch(() => {}),
      postgres.stop().catch(() => {}),
    ]);
    await network.stop().catch(() => {});
    log('stack stopped');
  };

  return { network, postgres, dragonfly, mailpit, api, cron, stop };
}

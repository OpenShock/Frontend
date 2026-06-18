// Brings up the integration backend stack using Testcontainers (the library),
// instead of orchestrating `docker compose` by hand. Testcontainers manages a
// dedicated network, container lifecycle and (via Ryuk) reaping of orphans, so
// a crashed test run can't leave the stack running.
//
// The frontend's Vite dev server proxies /1 and /2 to the API on a fixed host
// port (VITE_API_PROXY_TARGET, default https://localhost:5001), and the tests
// read mail from Mailpit on a fixed host port (default http://localhost:8025),
// so those two containers bind fixed host ports. Postgres and Redis are only
// reached by the API over the internal network, so they need no host ports.

import { GenericContainer, Network, Wait } from 'testcontainers';

const API_IMAGE = process.env.INTEGRATION_API_IMAGE ?? 'ghcr.io/openshock/api:develop';
const POSTGRES_IMAGE = process.env.INTEGRATION_POSTGRES_IMAGE ?? 'postgres:16-alpine';
const REDIS_IMAGE = process.env.INTEGRATION_REDIS_IMAGE ?? 'redis/redis-stack-server:latest';
const MAILPIT_IMAGE = process.env.INTEGRATION_MAILPIT_IMAGE ?? 'axllent/mailpit:latest';

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

const FRONTEND_URL = process.env.TEST_FRONTEND_URL ?? 'https://localhost:5173';

const log = (msg) => process.stdout.write(`[integration-stack] ${msg}\n`);

/**
 * Starts postgres, redis, mailpit and the API on a shared network and waits
 * for each to become ready. Resolves to an object with the started containers
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
    .withExposedPorts({ container: 443, host: API_HOST_PORT })
    .withEnvironment({
      ASPNETCORE_ENVIRONMENT: 'Development',
      OPENSHOCK_DISABLE_RATE_LIMITING: '1',
      OPENSHOCK__DB__CONN:
        'Host=postgres;Port=5432;Database=openshock;Username=openshock;Password=openshock',
      OPENSHOCK__REDIS__HOST: 'redis',
      OPENSHOCK__FRONTEND__SHORTURL: FRONTEND_URL,
      OPENSHOCK__FRONTEND__BASEURL: FRONTEND_URL,
      OPENSHOCK__FRONTEND__COOKIEDOMAIN: 'localhost',
      OPENSHOCK__TURNSTILE__ENABLE: 'false',
      OPENSHOCK__MAIL__TYPE: 'SMTP',
      OPENSHOCK__MAIL__SENDER__NAME: 'OpenShock Dev',
      OPENSHOCK__MAIL__SENDER__EMAIL: 'dev@openshock.dev',
      OPENSHOCK__MAIL__SMTP__HOST: 'mailpit',
      OPENSHOCK__MAIL__SMTP__PORT: '1025',
      OPENSHOCK__MAIL__SMTP__USERNAME: 'dev',
      OPENSHOCK__MAIL__SMTP__PASSWORD: 'dev',
      OPENSHOCK__MAIL__SMTP__ENABLESSL: 'false',
      OPENSHOCK__MAIL__SMTP__VERIFYCERTIFICATE: 'false',
      OPENSHOCK__LCG__COUNTRYCODE: 'DE',
    })
    .withWaitStrategy(
      // The API serves HTTPS with a self-signed dev cert; any HTTP response
      // (even 404) means Kestrel is up and migrations have completed.
      Wait.forHttp('/', 443)
        .usingTls()
        .allowInsecure()
        .forStatusCodeMatching(() => true)
    )
    .withStartupTimeout(Number(process.env.INTEGRATION_API_STARTUP_TIMEOUT_MS ?? 180_000))
    .start();
  log(`api ready (https on host port ${API_HOST_PORT})`);

  const stop = async () => {
    log('stopping stack ...');
    // Stop the API first so it stops talking to its dependencies.
    await api.stop().catch(() => {});
    await Promise.all([
      mailpit.stop().catch(() => {}),
      redis.stop().catch(() => {}),
      postgres.stop().catch(() => {}),
    ]);
    await network.stop().catch(() => {});
    log('stack stopped');
  };

  return { network, postgres, redis, mailpit, api, stop };
}

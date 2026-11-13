#!/usr/bin/env node
// Brings up the integration backend (via Testcontainers) and waits for it to be
// reachable before launching `vite dev --mode integration`. Playwright starts
// the webServer command before globalSetup, so we cannot rely on globalSetup to
// start the backend — the stack has to be up here, otherwise Vite SSR fetches
// race the API container coming up and Playwright times out the webServer probe.

import { spawn } from 'node:child_process';
import { request } from 'node:http';
import { startStack } from './integration-stack.mjs';

const API_URL = process.env.VITE_API_PROXY_TARGET ?? 'http://localhost:5001';
const FRONTEND_URL = process.env.TEST_FRONTEND_URL ?? 'http://localhost:5173';
const TIMEOUT_MS = Number(process.env.INTEGRATION_BACKEND_TIMEOUT_MS ?? 10 * 60 * 1000);
const POLL_INTERVAL_MS = 1500;

function probe(url) {
  return new Promise((resolve) => {
    // The stack only ever publishes the API over plain HTTP (see integration-stack.mjs), so
    // there is no TLS to negotiate here and no certificate to skip validating.
    const req = request(url, { method: 'GET', timeout: 2000 }, (res) => {
      res.resume();
      // Any HTTP response (even 404) means the server is accepting connections.
      resolve(true);
    });
    req.on('error', () => resolve(false));
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });
    req.end();
  });
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function waitForBackend() {
  const deadline = Date.now() + TIMEOUT_MS;
  let attempts = 0;
  process.stdout.write(`[dev:integration] waiting for backend at ${API_URL} ...\n`);
  while (Date.now() < deadline) {
    if (await probe(API_URL)) {
      process.stdout.write(`[dev:integration] backend reachable after ${attempts} attempt(s)\n`);
      return;
    }
    attempts++;
    await sleep(POLL_INTERVAL_MS);
  }
  process.stderr.write(
    `[dev:integration] backend at ${API_URL} did not become reachable within ${TIMEOUT_MS}ms\n`
  );
  process.exit(1);
}

let stack;
try {
  stack = await startStack();
} catch (err) {
  process.stderr.write(
    `[dev:integration] failed to start Testcontainers stack — is a Docker-compatible runtime available?\n${err}\n`
  );
  process.exit(1);
}

await waitForBackend();

const child = spawn('pnpm', ['exec', 'vite', 'dev', '--mode', 'integration'], {
  stdio: 'inherit',
  shell: process.platform === 'win32',
  // Lets src/env.ts and #lib/utils/url.ts accept the stack's plain-HTTP loopback API URL. Scoped
  // to this child so it cannot leak into a production build.
  env: {
    ...process.env,
    PUBLIC_ALLOW_INSECURE_LOCAL_API: '1',
    // The app, the Vite listen address (vite.config.ts) and the activation links the Cron host
    // builds (integration-stack.mjs) all follow TEST_FRONTEND_URL. Process env outranks
    // .env.integration, so overriding the URL in one place moves everything together.
    PUBLIC_SITE_URL: FRONTEND_URL,
    PUBLIC_SITE_SHORT_URL: FRONTEND_URL,
    PUBLIC_BACKEND_API_URL: FRONTEND_URL,
  },
});

let shuttingDown = false;
async function shutdown(code, signal) {
  if (shuttingDown) return;
  shuttingDown = true;
  await stack.stop().catch(() => {});
  // Exit explicitly. Re-raising the signal would do nothing: the handlers below are installed
  // for it, so the process would stay alive until whoever is waiting on it resorts to SIGKILL.
  process.exit(code ?? (signal ? 1 : 0));
}

child.on('exit', (code, signal) => shutdown(code, signal));

for (const sig of ['SIGINT', 'SIGTERM']) {
  process.on(sig, () => {
    // Forward to Vite; its exit handler triggers stack teardown.
    child.kill(sig);
  });
}

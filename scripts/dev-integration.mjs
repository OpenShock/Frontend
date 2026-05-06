#!/usr/bin/env node
// Brings up the integration backend (docker-compose) and waits for it to be
// reachable before launching `vite dev --mode integration`. Playwright starts
// the webServer command before globalSetup, so we cannot rely on globalSetup
// to start docker — we have to do it here, otherwise Vite SSR fetches race
// the API container coming up and Playwright times out the webServer probe.

import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { request as httpsRequest } from 'node:https';
import { request as httpRequest } from 'node:http';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const API_URL = process.env.VITE_API_PROXY_TARGET ?? 'https://localhost:5001';
const TIMEOUT_MS = Number(process.env.INTEGRATION_BACKEND_TIMEOUT_MS ?? 10 * 60 * 1000);
const POLL_INTERVAL_MS = 1500;

function probe(url) {
  return new Promise((resolve) => {
    const req = (url.startsWith('https:') ? httpsRequest : httpRequest)(
      url,
      { method: 'GET', rejectUnauthorized: false, timeout: 2000 },
      (res) => {
        res.resume();
        // Any HTTP response (even 404) means the server is accepting connections.
        resolve(true);
      }
    );
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

function startDockerStack() {
  process.stdout.write('[dev:integration] starting docker-compose stack ...\n');
  const result = spawnSync(
    'docker',
    ['compose', '-f', 'docker-compose.integration.yml', 'up', '-d', '--wait'],
    { cwd: ROOT, stdio: 'inherit' }
  );
  if (result.status !== 0) {
    process.stderr.write(
      '[dev:integration] failed to start docker stack — is Docker Desktop running?\n'
    );
    process.exit(result.status ?? 1);
  }
}

startDockerStack();
await waitForBackend();

const child = spawn('pnpm', ['exec', 'vite', 'dev', '--mode', 'integration'], {
  stdio: 'inherit',
  shell: process.platform === 'win32',
});

child.on('exit', (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  else process.exit(code ?? 0);
});

for (const sig of ['SIGINT', 'SIGTERM']) {
  process.on(sig, () => child.kill(sig));
}

import { defineConfig } from '@playwright/test';

// Playwright's test-runner Node process makes direct fetch() calls to the API
// container (self-signed cert) and to the Vite dev server (mkcert local CA).
// Neither is in the system trust store, so relax verification for this process.
process.env.NODE_TLS_REJECT_UNAUTHORIZED ??= '0';

const FRONTEND_URL = process.env.TEST_FRONTEND_URL ?? 'https://localhost:5173';
const BACKEND_URL = process.env.TEST_BACKEND_URL ?? 'https://localhost:5001';
const MAILPIT_URL = process.env.TEST_MAILPIT_URL ?? 'http://localhost:8025';
const TURNSTILE_BYPASS = process.env.TEST_TURNSTILE_BYPASS ?? 'dev-bypass';

export default defineConfig({
  testDir: 'e2e/integration',
  testMatch: /.*\.spec\.ts$/,
  reporter: process.env.CI ? 'github' : 'html',
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  globalSetup: './e2e/integration/lib/global-setup.ts',
  globalTeardown: './e2e/integration/lib/global-teardown.ts',
  webServer: {
    command: 'pnpm dev:integration',
    url: FRONTEND_URL,
    reuseExistingServer: !process.env.CI,
    ignoreHTTPSErrors: true,
    timeout: 120_000,
  },
  use: {
    baseURL: FRONTEND_URL,
    ignoreHTTPSErrors: true,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    extraHTTPHeaders: { 'x-test-run': '1' },
  },
  metadata: {
    frontendUrl: FRONTEND_URL,
    backendUrl: BACKEND_URL,
    mailpitUrl: MAILPIT_URL,
    turnstileBypass: TURNSTILE_BYPASS,
  },
});

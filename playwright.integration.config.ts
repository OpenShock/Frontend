import { defineConfig } from '@playwright/test';

// Allow self-signed certificates from the local API dev container
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const FRONTEND_URL = process.env.TEST_FRONTEND_URL ?? 'https://localhost:5173';
const BACKEND_URL = process.env.TEST_BACKEND_URL ?? 'https://localhost:5001';
const TURNSTILE_BYPASS = process.env.TEST_TURNSTILE_BYPASS ?? 'dev-bypass';

export default defineConfig({
  testDir: 'e2e/integration',
  testMatch: /.*\.spec\.ts$/,
  reporter: process.env.CI ? 'github' : 'html',
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
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
    turnstileBypass: TURNSTILE_BYPASS,
  },
});

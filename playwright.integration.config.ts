import { defineConfig } from '@playwright/test';

const FRONTEND_URL = process.env.TEST_FRONTEND_URL ?? 'https://local.openshock.dev';
const BACKEND_URL = process.env.TEST_BACKEND_URL ?? 'https://api.openshock.dev';
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

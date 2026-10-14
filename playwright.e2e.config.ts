/**
 * Full E2E test configuration — tests the complete browser user journey
 * including signup, email verification, login, and logout.
 *
 * Target environment: next.openshock.dev (no captcha enforcement)
 * Override via environment variables:
 *   TEST_FRONTEND_URL  – frontend base URL  (default: https://next.openshock.dev)
 *   TEST_BACKEND_URL   – backend API URL    (default: https://api.openshock.dev)
 *   TEST_MAILPIT_URL   – MailPit HTTP URL   (default: '' → email tests skipped)
 *
 * Email verification tests:
 *   Requires MailPit running locally and the backend configured to send mail
 *   to MailPit's SMTP port (default 1025).
 *
 *   docker run -d -p 8025:8025 -p 1025:1025 axllent/mailpit
 *   TEST_MAILPIT_URL=http://localhost:8025 pnpm test:e2e:full
 */

import { defineConfig } from '@playwright/test';

const FRONTEND_URL = process.env.TEST_FRONTEND_URL ?? 'https://next.openshock.dev';

export default defineConfig({
  testDir: 'e2e/e2e',
  testMatch: /.*\.spec\.ts$/,

  // Full E2E is slower — allow longer per-test timeouts
  timeout: 60_000,
  expect: { timeout: 10_000 },

  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'html',

  // Run sequentially — each test creates a real account on the backend
  fullyParallel: false,
  workers: 1,

  // Retry once in CI to absorb transient network flakiness
  retries: process.env.CI ? 1 : 0,

  use: {
    baseURL: FRONTEND_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    // Longer navigation timeout for real network round-trips
    navigationTimeout: 20_000,
    actionTimeout: 10_000,
  },
});

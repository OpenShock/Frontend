// Full E2E tests.
// Local dev:  TEST_FRONTEND_URL=https://local.openshock.dev  (pnpm dev)
// Staging:    TEST_FRONTEND_URL=https://next.openshock.dev   (no captcha enforcement)
export const FRONTEND_URL = process.env.TEST_FRONTEND_URL ?? 'https://next.openshock.dev';
export const BACKEND_URL = process.env.TEST_BACKEND_URL ?? 'https://api.openshock.dev';

// MailPit captures test emails and exposes an HTTP API for reading them.
// In local dev, MailPit is included in Dev/docker-compose.yml and listens on
// localhost:8025 (HTTP UI) and localhost:1025 (SMTP).
// Set TEST_MAILPIT_URL to enable email-verification tests; leave empty to skip them.
// Local default:  http://localhost:8025
// CI/staging:     set explicitly or leave empty to skip
export const MAILPIT_URL = process.env.TEST_MAILPIT_URL ?? '';

import { defineConfig } from '@playwright/test';

export default defineConfig({
  reporter: process.env.CI ? 'github' : 'html',
  use: {
    baseURL: 'https://local.openshock.app:4173',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'pnpm run build && pnpm run preview',
    port: 4173,
  },
  testDir: 'e2e',
});

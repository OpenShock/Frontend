import { expect, test } from './lib/test-fixtures';

// ---------------------------------------------------------------------------
// Auth routes — unauthenticated access
// ---------------------------------------------------------------------------

test.describe('public auth routes', () => {
  test('GET /login returns 200', async ({ page }) => {
    const res = await page.goto('/login');
    expect(res!.status()).toBe(200);
  });

  test('GET /signup returns 200', async ({ page }) => {
    const res = await page.goto('/signup');
    expect(res!.status()).toBe(200);
  });

  test('GET /forgot-password returns 200', async ({ page }) => {
    const res = await page.goto('/forgot-password');
    expect(res!.status()).toBe(200);
  });
});

// ---------------------------------------------------------------------------
// App routes — must redirect unauthenticated users to /login
// ---------------------------------------------------------------------------

const PROTECTED_ROUTES = [
  '/home',
  '/profile',
  '/settings/account',
  '/settings/api-tokens',
  '/settings/sessions',
  '/settings/connections',
  '/hubs',
  '/shockers/own',
  '/shockers/shared',
  '/shockers/logs',
  '/shares/user/outgoing',
  '/shares/user/incoming',
  '/shares/user/invites',
  '/shares/public',
];

for (const route of PROTECTED_ROUTES) {
  test(`unauthenticated GET ${route} redirects to /login`, async ({ page }) => {
    await page.goto(route);
    await page.waitForURL(/\/login/, { timeout: 8000 });
    expect(page.url()).toMatch(/\/login/);
  });
}

// ---------------------------------------------------------------------------
// Authenticated redirects — logged-in users shouldn't see auth pages
// ---------------------------------------------------------------------------

test.describe('auth-page redirects for authenticated users', () => {
  // The auth layout redirects once the client has booted and knows the user is signed in. A
  // fixed wait races that against route compilation on a cold dev server, so wait for the
  // URL itself to leave the auth page.
  test('authenticated GET /login redirects away from login', async ({ authedPage }) => {
    await authedPage.goto('/login');
    await authedPage.waitForURL((url) => !/\/login(\?|$)/.test(url.href), { timeout: 10000 });
    expect(authedPage.url()).not.toMatch(/\/login(\?|$)/);
  });

  test('authenticated GET /signup redirects away from signup', async ({ authedPage }) => {
    await authedPage.goto('/signup');
    await authedPage.waitForURL((url) => !/\/signup(\?|$)/.test(url.href), { timeout: 10000 });
    expect(authedPage.url()).not.toMatch(/\/signup(\?|$)/);
  });
});

// ---------------------------------------------------------------------------
// Terminal route (public)
// ---------------------------------------------------------------------------

test.describe('terminal page', () => {
  test('GET /terminal returns 200', async ({ page }) => {
    const res = await page.goto('/terminal');
    expect(res?.status()).toBeLessThan(400);
  });

  test('terminal page has the expected UI structure', async ({ page }) => {
    await page.goto('/terminal');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { name: /serial terminal/i })).toBeVisible();
    // With WebSerial the page offers the mode picker; headless Chromium has no WebSerial and
    // gets the unsupported-browser notice instead. Either way something must render below the
    // heading, so a blank body fails.
    await expect(
      page
        .getByText(/configure device/i)
        .or(page.getByText(/does not support this feature/i))
        .first()
    ).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// Meta / utility routes
// ---------------------------------------------------------------------------

test.describe('meta routes', () => {
  test('GET /llms.txt returns text content', async ({ page }) => {
    const res = await page.goto('/llms.txt');
    expect(res?.status()).toBe(200);
    const contentType = res?.headers()['content-type'] ?? '';
    expect(contentType).toMatch(/text/);
  });
});

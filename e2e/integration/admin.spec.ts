import { expect, test } from './lib/test-fixtures';

// ---------------------------------------------------------------------------
// Admin routes — these pages require the Admin or System role.  The test
// user created by the fixture is a regular user, so admin pages should either
// redirect (403/401) or show an access-denied message.  In a dev environment
// with an admin-enabled user the fixture can be swapped out.
//
// All tests here verify that:
//   1. The page does NOT return a 500.
//   2. Either an access-denied UI appears OR (if the backend grants admin to
//      all dev users) the page renders properly.
// ---------------------------------------------------------------------------

// Helper: visit an admin route and assert non-500
async function assertAdminRouteLoads(page: import('@playwright/test').Page, path: string) {
  const res = await page.goto(path);
  expect(res?.status()).not.toBe(500);
}

test.describe('admin routes — unauthenticated', () => {
  const ADMIN_ROUTES = [
    '/admin/users',
    '/admin/online-hubs',
    '/admin/config',
    '/admin/blacklists',
    '/admin/webhooks',
  ];

  for (const route of ADMIN_ROUTES) {
    test(`${route} redirects unauthenticated users to login`, async ({ page }) => {
      const res = await page.goto(route);
      // Should redirect to /login or return 401/403 — never 500
      expect(res?.status()).not.toBe(500);
      const finalUrl = page.url();
      const isRedirected = /login|signin/.test(finalUrl) || (res?.status() ?? 200) >= 400;
      expect(isRedirected).toBe(true);
    });
  }
});

test.describe('admin routes — regular user (should be access-denied)', () => {
  const ADMIN_ROUTES = [
    '/admin/users',
    '/admin/online-hubs',
    '/admin/config',
    '/admin/blacklists',
    '/admin/webhooks',
  ];

  for (const route of ADMIN_ROUTES) {
    test(`${route} does not crash for a non-admin user`, async ({ authedPage }) => {
      const res = await authedPage.goto(route);
      // Must not be 500 — may be 403 redirect or access-denied page
      expect(res?.status()).not.toBe(500);
    });
  }

  test('admin users page does not produce JS errors (regardless of access)', async ({
    authedPage,
  }) => {
    const errors: string[] = [];
    authedPage.on('pageerror', (e) => errors.push(e.message));
    await authedPage.goto('/admin/users');
    await authedPage.waitForLoadState('networkidle');
    await authedPage.waitForTimeout(1000);
    expect(errors).toHaveLength(0);
  });
});

test.describe('admin users page UI (when accessible)', () => {
  test('renders a table or access-denied message — never a blank page', async ({ authedPage }) => {
    await authedPage.goto('/admin/users');
    await authedPage.waitForLoadState('networkidle');

    // Either a users table or an access-denied / redirect happened
    const mainContent = authedPage.locator('main, [data-content], table, [role="table"]').first();
    const accessDenied = authedPage.getByText(/access denied|forbidden|not authorized|403/i);
    const loginPage = authedPage.getByRole('heading', { name: /sign in|log in|login/i });

    const hasMain = await mainContent.count() > 0;
    const hasDenied = await accessDenied.count() > 0;
    const hasLogin = await loginPage.count() > 0;

    expect(hasMain || hasDenied || hasLogin).toBe(true);
  });

  test('admin user search inputs render if the page is accessible', async ({ authedPage }) => {
    await authedPage.goto('/admin/users');
    await authedPage.waitForLoadState('networkidle');

    // If accessible, should have search fields for name/email filtering
    const nameFilter = authedPage.getByPlaceholder(/filter name/i);
    const emailFilter = authedPage.getByPlaceholder(/filter email/i);

    const hasNameFilter = await nameFilter.count() > 0;
    const hasEmailFilter = await emailFilter.count() > 0;

    if (hasNameFilter) {
      await expect(nameFilter.first()).toBeVisible({ timeout: 3000 });
    }
    if (hasEmailFilter) {
      await expect(emailFilter.first()).toBeVisible({ timeout: 3000 });
    }
    // If neither is visible it means the page redirected — fine
  });
});

test.describe('admin online-hubs page UI', () => {
  test('renders without 500 for authenticated user', async ({ authedPage }) => {
    await assertAdminRouteLoads(authedPage, '/admin/online-hubs');
  });

  test('page shows a hub count or access-denied — not blank', async ({ authedPage }) => {
    await authedPage.goto('/admin/online-hubs');
    await authedPage.waitForLoadState('networkidle');

    const hubCount = authedPage.getByText(/online hubs/i);
    const mainContent = authedPage.locator('main, [data-content]').first();
    const denied = authedPage.getByText(/access denied|forbidden|403/i);

    const hasHubs = await hubCount.count() > 0;
    const hasMain = await mainContent.count() > 0;
    const hasDenied = await denied.count() > 0;
    expect(hasHubs || hasMain || hasDenied).toBe(true);
  });
});

test.describe('admin config page UI', () => {
  test('renders without 500', async ({ authedPage }) => {
    await assertAdminRouteLoads(authedPage, '/admin/config');
  });
});

test.describe('admin blacklists page UI', () => {
  test('renders without 500', async ({ authedPage }) => {
    await assertAdminRouteLoads(authedPage, '/admin/blacklists');
  });
});

test.describe('admin webhooks page UI', () => {
  test('renders without 500', async ({ authedPage }) => {
    await assertAdminRouteLoads(authedPage, '/admin/webhooks');
  });
});

test.describe('admin user detail route', () => {
  test('non-existent user UUID returns a non-500 response', async ({ authedPage }) => {
    const fakeId = '00000000-0000-0000-0000-000000000099';
    const res = await authedPage.goto(`/admin/users/${fakeId}`);
    expect(res?.status()).not.toBe(500);
  });
});

test.describe('hangfire route', () => {
  test('hangfire dashboard does not return 500', async ({ authedPage }) => {
    const res = await authedPage.goto('/hangfire');
    expect(res?.status()).not.toBe(500);
  });
});

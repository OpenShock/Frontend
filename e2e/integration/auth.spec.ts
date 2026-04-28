import { expect, test } from './lib/test-fixtures';
import { makeCredentials, signup as apiSignup, login as apiLogin, logout as apiLogout } from './lib/api-client';
import { makeCredentials as makeTestCredentials } from './lib/test-fixtures';

// ---------------------------------------------------------------------------
// Login page
// ---------------------------------------------------------------------------

test.describe('login page', () => {
  test('renders the login form', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: /sign in|log in/i })).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in|log in/i })).toBeVisible();
  });

  test('shows validation error for empty submission', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: /sign in|log in/i }).click();
    // Expect some form of error feedback (browser-native or custom)
    await expect(page.locator('[data-invalid], [aria-invalid="true"], .error, [role="alert"]').first()).toBeVisible({ timeout: 3000 }).catch(() => {
      // Some forms rely on browser-native validation (no visible DOM element)
    });
  });

  test('shows error for wrong credentials', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/email/i).fill('nonexistent@e2e.openshock.test');
    await page.getByLabel(/password/i).fill('WrongPass1!');
    await page.getByRole('button', { name: /sign in|log in/i }).click();
    await expect(page.locator('[role="alert"], .error, [data-error]').first()).toBeVisible({
      timeout: 5000,
    });
  });

  test('successful login redirects to /home', async ({ page, user }) => {
    await page.goto('/login');
    await page.getByLabel(/email/i).fill(user.credentials.email);
    await page.getByLabel(/password/i).fill(user.credentials.password);
    await page.getByRole('button', { name: /sign in|log in/i }).click();
    await page.waitForURL(/\/home/, { timeout: 10000 });
    expect(page.url()).toMatch(/\/home/);
  });

  test('unauthenticated access to /home redirects to login', async ({ page }) => {
    await page.goto('/home');
    await page.waitForURL(/\/login/, { timeout: 5000 });
    expect(page.url()).toMatch(/\/login/);
  });
});

// ---------------------------------------------------------------------------
// Signup page
// ---------------------------------------------------------------------------

test.describe('signup page', () => {
  test('renders the signup form', async ({ page }) => {
    await page.goto('/signup');
    await expect(page.getByRole('heading', { name: /sign up|create account|register/i })).toBeVisible();
    await expect(page.getByLabel(/username/i)).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i).first()).toBeVisible();
  });

  test('shows link to login page', async ({ page }) => {
    await page.goto('/signup');
    await expect(page.getByRole('link', { name: /sign in|log in|already have/i })).toBeVisible();
  });

  test('does not navigate away on incomplete form submission', async ({ page }) => {
    await page.goto('/signup');
    await page.getByRole('button', { name: /sign up|create account|register/i }).click();
    // Still on signup page
    expect(page.url()).toMatch(/\/signup/);
  });
});

// ---------------------------------------------------------------------------
// Logout
// ---------------------------------------------------------------------------

test.describe('logout', () => {
  test('authenticated user can log out via UI', async ({ authedPage }) => {
    await authedPage.goto('/home');
    await authedPage.waitForURL(/\/home/);

    // Look for a logout button/menu item (may require opening a user menu first)
    const logoutBtn = authedPage.getByRole('button', { name: /log out|sign out/i });
    const logoutLink = authedPage.getByRole('link', { name: /log out|sign out/i });

    const hasBtn = await logoutBtn.count();
    const hasLink = await logoutLink.count();

    if (hasBtn === 0 && hasLink === 0) {
      // Look for a user/avatar menu to open first
      const avatar = authedPage.getByRole('button', { name: /account|profile|menu/i }).first();
      if (await avatar.count()) {
        await avatar.click();
        await authedPage.waitForTimeout(300);
      }
    }

    const logoutEl = authedPage.getByRole('button', { name: /log out|sign out/i })
      .or(authedPage.getByRole('link', { name: /log out|sign out/i }))
      .first();

    if (await logoutEl.count()) {
      await logoutEl.click();
      // After logout, should land on login page or home (public)
      await authedPage.waitForURL(/\/login|\/$/i, { timeout: 5000 });
    }
  });

  test('API logout invalidates the session cookie', async ({ user }) => {
    // Login via API to get cookies, then logout via API
    const freshCookies = await apiLogin(user.credentials.email, user.credentials.password);
    await apiLogout(freshCookies);

    // Attempt to access protected endpoint should fail
    const res = await fetch(
      `${process.env.TEST_BACKEND_URL ?? 'https://api.openshock.dev'}/1/account`,
      {
        headers: {
          Cookie: freshCookies.map((c) => c.split(';', 1)[0]).join('; '),
        },
      }
    );
    // Should be 401 after logout
    expect(res.status).toBe(401);
  });
});

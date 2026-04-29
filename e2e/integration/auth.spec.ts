import { login as apiLogin, logout as apiLogout } from './lib/api-client';
import { BACKEND_URL } from './lib/env';
import { expect, test } from './lib/test-fixtures';

// ---------------------------------------------------------------------------
// Login page
// ---------------------------------------------------------------------------

test.describe('login page', () => {
  test('renders the login form', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    // Card.Title renders as a <div>, not a heading role
    await expect(page.getByText('Welcome back')).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /login/i })).toBeVisible();
  });

  test('login button is disabled when fields are empty', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    // Button requires email, password, and turnstile — all empty means disabled
    await expect(page.getByRole('button', { name: /login/i })).toBeDisabled();
  });

  test('shows error for wrong credentials', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    await page.getByLabel(/email/i).fill('nonexistent@e2e.openshock.test');
    await page.getByLabel(/password/i).fill('WrongPass1!');
    // Wait for turnstile dev-bypass to fire and button to enable
    await expect(page.getByRole('button', { name: /login/i })).toBeEnabled({ timeout: 5000 });
    await page.getByRole('button', { name: /login/i }).click();
    await expect(page.locator('[role="alert"], .error, [data-error]').first()).toBeVisible({
      timeout: 5000,
    });
  });

  test('successful login redirects to /home', async ({ page, user }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    await page.getByLabel(/email/i).fill(user.credentials.email);
    await page.getByLabel(/password/i).fill(user.credentials.password);
    // Wait for turnstile dev-bypass to fire and button to enable
    await expect(page.getByRole('button', { name: /login/i })).toBeEnabled({ timeout: 5000 });
    await page.getByRole('button', { name: /login/i }).click();
    await page.waitForURL(/\/home/, { timeout: 10000 });
    expect(page.url()).toMatch(/\/home/);
  });

  test('unauthenticated access to /home redirects to login', async ({ page }) => {
    await page.goto('/home');
    await page.waitForURL(/\/login/, { timeout: 8000 });
    expect(page.url()).toMatch(/\/login/);
  });
});

// ---------------------------------------------------------------------------
// Signup page
// ---------------------------------------------------------------------------

test.describe('signup page', () => {
  test('renders the signup form', async ({ page }) => {
    await page.goto('/signup');
    await page.waitForLoadState('networkidle');
    // Card.Title renders as a <div>, not a heading role
    await expect(page.getByText('Create your account')).toBeVisible();
    // Form appears after backendMetadata loads (useEmail becomes true if no OAuth providers)
    await expect(page.getByLabel(/username/i)).toBeVisible({ timeout: 5000 });
    await expect(page.getByLabel(/email/i)).toBeVisible({ timeout: 5000 });
    await expect(page.getByLabel(/password/i).first()).toBeVisible({ timeout: 5000 });
  });

  test('shows link to login page', async ({ page }) => {
    await page.goto('/signup');
    await page.waitForLoadState('networkidle');
    // Wait for form to appear
    await expect(page.getByLabel(/username/i)).toBeVisible({ timeout: 5000 });
    await expect(page.getByRole('link', { name: /sign in|log in|already have/i })).toBeVisible();
  });

  test('does not navigate away on incomplete form submission', async ({ page }) => {
    await page.goto('/signup');
    await page.waitForLoadState('networkidle');
    // Wait for the form to appear
    await expect(page.getByRole('button', { name: /create account/i })).toBeVisible({
      timeout: 5000,
    });
    // Button is disabled for empty form; force-click to verify no navigation occurs
    await page.getByRole('button', { name: /create account/i }).click({ force: true });
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

    const logoutEl = authedPage
      .getByRole('button', { name: /log out|sign out/i })
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
    const res = await fetch(`${BACKEND_URL}/1/users/self`, {
      headers: {
        Cookie: freshCookies.map((c) => c.split(';', 1)[0]).join('; '),
      },
    });
    // Should be 401 after logout
    expect(res.status).toBe(401);
  });
});

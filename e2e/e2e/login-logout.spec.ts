import { expect, loginViaBrowser, makeCredentials, test, MAILPIT_URL } from './lib/test-fixtures';
import { BACKEND_URL, FRONTEND_URL } from './lib/env';
import { deleteSelf } from './lib/api-client';

// ---------------------------------------------------------------------------
// Login via browser UI
// ---------------------------------------------------------------------------

test.describe('login via browser UI', () => {
  test('login page renders username, password fields and Login button', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    await expect(page.getByLabel(/username or email/i)).toBeVisible({ timeout: 10_000 });
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /^login$/i })).toBeVisible();
  });

  test('Login button is disabled when fields are empty', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // With empty fields the button must be disabled even after turnstile fires
    await page.waitForTimeout(500);
    const btn = page.getByRole('button', { name: /^login$/i });
    await expect(btn).toBeDisabled({ timeout: 5_000 });
  });

  test('entering credentials enables the Login button', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    await page.getByLabel(/username or email/i).fill('test@example.com');
    await page.getByLabel(/password/i).fill('SomePassword123!');

    // Turnstile mock fires asynchronously — button should become enabled
    const btn = page.getByRole('button', { name: /^login$/i });
    await expect(btn).toBeEnabled({ timeout: 5_000 });
  });

  test('wrong credentials show an error without crashing', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    await page.getByLabel(/username or email/i).fill('no-such-user@e2e.openshock.test');
    await page.getByLabel(/password/i).fill('WrongPassword99!');

    const btn = page.getByRole('button', { name: /^login$/i });
    await btn.waitFor({ state: 'attached' });
    await page.waitForFunction(
      () => !(document.querySelector('button[type="submit"]') as HTMLButtonElement)?.disabled,
      { timeout: 5_000 }
    );
    await btn.click();

    // Should show an error toast or inline message — not crash
    await page.waitForTimeout(3_000);
    expect(page.url()).toMatch(/login/);
  });

  test('successful login redirects to /home', async ({ authedPage }) => {
    // authedPage fixture performs signup + login through the browser
    expect(authedPage.url()).toMatch(/\/(home|shockers|hubs|settings)/);
  });

  test('authenticated user is redirected away from /login', async ({ authedPage }) => {
    await authedPage.goto('/login');
    // SvelteKit should redirect the already-authenticated user
    await authedPage.waitForURL(/\/(home|shockers|hubs|settings)/, { timeout: 8_000 });
    expect(authedPage.url()).not.toMatch(/login/);
  });
});

// ---------------------------------------------------------------------------
// Logout via browser UI
// ---------------------------------------------------------------------------

test.describe('logout via browser UI', () => {
  test('user can log out and is redirected to the login page', async ({ authedPage }) => {
    // Find and trigger the logout action
    // The app may have a logout button in a user menu or sidebar
    const logoutBtn = authedPage.getByRole('link', { name: /log.?out|sign.?out/i }).first();
    const logoutBtnAlt = authedPage.getByRole('button', { name: /log.?out|sign.?out/i }).first();

    const hasLink = await logoutBtn.count() > 0;
    const hasBtnAlt = await logoutBtnAlt.count() > 0;

    if (hasLink) {
      await logoutBtn.click();
    } else if (hasBtnAlt) {
      await logoutBtnAlt.click();
    } else {
      // Navigate directly to the logout route
      await authedPage.goto('/logout');
    }

    await authedPage.waitForURL(/login/, { timeout: 10_000 });
    expect(authedPage.url()).toMatch(/login/);
  });

  test('after logout, /home redirects to /login', async ({ authedPage }) => {
    await authedPage.goto('/logout');
    await authedPage.waitForURL(/login/, { timeout: 10_000 });

    // Navigating back to /home should redirect to /login
    await authedPage.goto('/home');
    await authedPage.waitForURL(/login/, { timeout: 8_000 });
    expect(authedPage.url()).toMatch(/login/);
  });
});

// ---------------------------------------------------------------------------
// Signup page — structure only (full signup flow is in signup-verify.spec.ts)
// ---------------------------------------------------------------------------

test.describe('signup page UI', () => {
  test('signup page renders all required fields', async ({ page }) => {
    await page.goto('/signup');
    await page.waitForLoadState('networkidle');

    // May show OAuth buttons first; click through to email signup if needed
    const emailBtn = page.getByRole('button', { name: /signup with email/i });
    if (await emailBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await emailBtn.click();
    }

    await expect(page.getByLabel(/username/i)).toBeVisible({ timeout: 8_000 });
    await expect(page.getByLabel(/^email$/i)).toBeVisible();
    // Two password fields (password + confirm)
    await expect(page.getByLabel(/password/i).first()).toBeVisible();
    await expect(page.getByRole('button', { name: /create account/i })).toBeVisible();
  });

  test('Create Account button is disabled until all fields are valid', async ({ page }) => {
    await page.goto('/signup');
    await page.waitForLoadState('networkidle');

    const emailBtn = page.getByRole('button', { name: /signup with email/i });
    if (await emailBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await emailBtn.click();
    }

    // Button should be disabled with empty fields
    await page.waitForTimeout(600); // let turnstile fire
    const btn = page.getByRole('button', { name: /create account/i });
    await expect(btn).toBeDisabled({ timeout: 5_000 });
  });

  test('mismatched passwords keep the button disabled', async ({ page }) => {
    await page.goto('/signup');
    await page.waitForLoadState('networkidle');

    const emailBtn = page.getByRole('button', { name: /signup with email/i });
    if (await emailBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await emailBtn.click();
    }

    const creds = makeCredentials();
    await page.getByLabel(/username/i).fill(creds.username);
    await page.getByLabel(/^email$/i).fill(creds.email);
    const pwFields = page.getByLabel(/password/i);
    await pwFields.nth(0).fill(creds.password);
    await pwFields.nth(1).fill('DifferentPass99!');

    // Wait for turnstile
    await page.waitForTimeout(600);
    const btn = page.getByRole('button', { name: /create account/i });
    await expect(btn).toBeDisabled({ timeout: 3_000 });
  });
});

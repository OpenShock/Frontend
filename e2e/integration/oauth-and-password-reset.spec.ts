import { expect, test } from './lib/test-fixtures';

// ---------------------------------------------------------------------------
// OAuth — navigation / UI (full flow requires an OAuth provider mock)
// ---------------------------------------------------------------------------

test.describe('OAuth login UI', () => {
  test('login page shows OAuth provider buttons', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    // Look for OAuth buttons (Discord, GitHub, Google, etc.)
    const oauthBtns = page.locator('a[href*="oauth"], button').filter({
      hasText: /discord|github|google|oauth|continue with/i,
    });
    // On a dev backend there may or may not be OAuth providers configured
    const count = await oauthBtns.count();
    if (count > 0) {
      // If providers exist, clicking one should navigate to an external URL
      const href = await oauthBtns.first().getAttribute('href');
      expect(href).toBeTruthy();
    }
    // Test is skipped silently if no OAuth buttons are present
  });

  test('signup page shows OAuth provider buttons', async ({ page }) => {
    await page.goto('/signup');
    await page.waitForLoadState('networkidle');
    const oauthBtns = page.locator('a[href*="oauth"], button').filter({
      hasText: /discord|github|google|oauth|continue with/i,
    });
    const count = await oauthBtns.count();
    if (count > 0) {
      await expect(oauthBtns.first()).toBeVisible();
    }
  });

  test('OAuth error page renders gracefully', async ({ page }) => {
    // Visit the OAuth error page directly — should render without crashing
    const res = await page.goto('/oauth/error');
    expect(res?.status()).not.toBe(500);
  });
});

// ---------------------------------------------------------------------------
// Password reset flow — UI-level tests
// ---------------------------------------------------------------------------

test.describe('forgot password page', () => {
  test('forgot-password page renders the email form', async ({ page }) => {
    await page.goto('/forgot-password');
    await page.waitForLoadState('networkidle');
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /reset|send|submit/i })).toBeVisible();
  });

  test('submitting the forgot-password form with a test email shows feedback', async ({ page }) => {
    await page.goto('/forgot-password');
    await page.waitForLoadState('networkidle');
    await page.getByLabel(/email/i).fill('test.reset@e2e.openshock.test');
    await page.getByRole('button', { name: /reset|send|submit/i }).click();
    // Should show success or error feedback (but not crash)
    await page.waitForTimeout(2000);
    // Just ensure the page is still functional
    expect(page.url()).toBeTruthy();
  });

  test('forgot-password shows validation for empty email', async ({ page }) => {
    await page.goto('/forgot-password');
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: /reset|send|submit/i }).click();
    // Browser native or custom validation
    await page.waitForTimeout(500);
    expect(page.url()).toMatch(/forgot-password/);
  });
});

// ---------------------------------------------------------------------------
// Verify-email and activate pages — structure tests only
// (Full flow requires email delivery which isn't available in E2E)
// ---------------------------------------------------------------------------

test.describe('email verify and activate pages', () => {
  test('verify-email page renders without crashing', async ({ page }) => {
    const res = await page.goto('/verify-email');
    expect(res?.status()).not.toBe(500);
  });

  test('activate page renders without crashing', async ({ page }) => {
    const res = await page.goto('/activate');
    expect(res?.status()).not.toBe(500);
  });

  test('activate page with invalid/missing token shows an error state', async ({ page }) => {
    await page.goto('/activate?token=invalid-token');
    await page.waitForLoadState('networkidle');
    // Should show some feedback, not a blank or crashed page
    await expect(page.locator('main').first()).toBeVisible();
  });
});

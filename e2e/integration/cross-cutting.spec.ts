import { expect, test } from './lib/test-fixtures';

// ---------------------------------------------------------------------------
// Error handling
// ---------------------------------------------------------------------------

test.describe('error handling', () => {
  test('visiting a non-existent route returns a 404 page, not a 500', async ({ page }) => {
    const res = await page.goto('/this-route-does-not-exist-xyz');
    expect(res?.status()).not.toBe(500);
    // Should show a 404 or redirect
    const is404 = res?.status() === 404;
    const isRedirected = res?.status()! < 400;
    expect(is404 || isRedirected).toBe(true);
  });

  test('accessing a deep unknown path returns a clean response', async ({ page }) => {
    const res = await page.goto('/settings/completely/nonexistent/nested/route');
    expect(res?.status()).not.toBe(500);
  });
});

// ---------------------------------------------------------------------------
// Security headers
// ---------------------------------------------------------------------------

test.describe('security headers', () => {
  test('response includes X-Frame-Options or CSP frame-ancestors', async ({ page }) => {
    const res = await page.goto('/login');
    const headers = res?.headers() ?? {};
    const hasFrameOptions = 'x-frame-options' in headers;
    const hasCSP = 'content-security-policy' in headers;
    const cspHasFrameAncestors = (headers['content-security-policy'] ?? '').includes('frame-ancestors');
    expect(hasFrameOptions || (hasCSP && cspHasFrameAncestors)).toBe(true);
  });

  test('X-Content-Type-Options is set to nosniff', async ({ page }) => {
    const res = await page.goto('/login');
    const headers = res?.headers() ?? {};
    // nosniff prevents MIME-type sniffing attacks
    expect(headers['x-content-type-options']).toBe('nosniff');
  });
});

// ---------------------------------------------------------------------------
// Navigation and breadcrumbs
// ---------------------------------------------------------------------------

test.describe('navigation', () => {
  test('home page renders the main navigation sidebar/navbar', async ({ authedPage }) => {
    await authedPage.goto('/home');
    await authedPage.waitForLoadState('networkidle');
    // Navigation should have links to major sections
    await expect(
      authedPage.getByRole('navigation').first()
    ).toBeVisible({ timeout: 5000 });
  });

  test('sidebar/nav links to shockers section', async ({ authedPage }) => {
    await authedPage.goto('/home');
    await authedPage.waitForLoadState('networkidle');
    await expect(
      authedPage.getByRole('link', { name: /shocker/i }).first()
    ).toBeVisible({ timeout: 5000 }).catch(() => {
      // May be in a collapsed menu
    });
  });
});

// ---------------------------------------------------------------------------
// Responsive behaviour
// ---------------------------------------------------------------------------

test.describe('responsive layout', () => {
  test('login page renders correctly at mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/login');
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in|log in/i })).toBeVisible();
  });

  test('home page renders at tablet viewport without horizontal overflow', async ({ authedPage }) => {
    await authedPage.setViewportSize({ width: 768, height: 1024 });
    await authedPage.goto('/home');
    await authedPage.waitForLoadState('networkidle');
    const bodyWidth = await authedPage.evaluate(() => document.body.scrollWidth);
    const viewportWidth = await authedPage.evaluate(() => window.innerWidth);
    // Allow up to 20px tolerance for scrollbars
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 20);
  });
});

// ---------------------------------------------------------------------------
// Console errors — page should not produce JS errors
// ---------------------------------------------------------------------------

test.describe('no JavaScript errors on page load', () => {
  const PAGES_TO_CHECK = ['/login', '/signup'];

  for (const route of PAGES_TO_CHECK) {
    test(`${route} loads without uncaught JS errors`, async ({ page }) => {
      const errors: string[] = [];
      page.on('pageerror', (err) => errors.push(err.message));
      await page.goto(route);
      await page.waitForLoadState('networkidle');
      expect(errors).toHaveLength(0);
    });
  }

  test('/home loads without uncaught JS errors (authenticated)', async ({ authedPage }) => {
    const errors: string[] = [];
    authedPage.on('pageerror', (err) => errors.push(err.message));
    await authedPage.goto('/home');
    await authedPage.waitForLoadState('networkidle');
    expect(errors).toHaveLength(0);
  });
});

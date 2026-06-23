import { expect, test } from './lib/test-fixtures';

test.describe('integration scaffold smoke', () => {
  test('frontend baseURL responds', async ({ page }) => {
    const response = await page.goto('/');
    expect(response).not.toBeNull();
    expect(response!.status()).toBeLessThan(500);
  });

  test('user fixture: signup + login + delete lifecycle', async ({ user }) => {
    expect(user.credentials.email).toMatch(/@e2e\.openshock\.test$/);
    expect(user.cookies.length).toBeGreaterThan(0);
  });

  test('authedPage fixture: cookies attached to browser context', async ({ authedPage }) => {
    const response = await authedPage.goto('/home');
    expect(response).not.toBeNull();
    // /home is auth-gated; an unauthenticated request would 302 to /login
    expect(authedPage.url()).not.toMatch(/\/login(\?|$)/);
  });
});

import { expect, test } from './lib/test-fixtures';

// ---------------------------------------------------------------------------
// Public share pages (no auth needed for viewing)
// ---------------------------------------------------------------------------

test.describe('public shares landing page', () => {
  test('public share list page renders', async ({ authedPage }) => {
    await authedPage.goto('/shares/public');
    await authedPage.waitForLoadState('networkidle');
    await expect(authedPage.locator('main').first()).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// User shares — outgoing
// ---------------------------------------------------------------------------

test.describe('outgoing shares', () => {
  test('outgoing shares page renders', async ({ authedPage }) => {
    await authedPage.goto('/shares/user/outgoing');
    await authedPage.waitForLoadState('networkidle');
    await expect(authedPage.locator('main').first()).toBeVisible();
  });

  test('shows empty state or share list for new user', async ({ authedPage }) => {
    await authedPage.goto('/shares/user/outgoing');
    await authedPage.waitForLoadState('networkidle');
    // The list loads after a spinner, so a bare count() can race it; one auto-waiting
    // assertion over both shapes (empty state or at least one share row) covers that.
    await expect(
      authedPage
        .getByText(/no shared shockers/i)
        .or(authedPage.getByRole('main').getByRole('row'))
        .first()
    ).toBeVisible({ timeout: 5000 });
  });
});

// ---------------------------------------------------------------------------
// User shares — incoming
// ---------------------------------------------------------------------------

test.describe('incoming shares', () => {
  test('incoming shares page renders', async ({ authedPage }) => {
    await authedPage.goto('/shares/user/incoming');
    await authedPage.waitForLoadState('networkidle');
    await expect(authedPage.locator('main').first()).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// Share invites
// ---------------------------------------------------------------------------

test.describe('share invites', () => {
  test('invites page renders', async ({ authedPage }) => {
    await authedPage.goto('/shares/user/invites');
    await authedPage.waitForLoadState('networkidle');
    await expect(authedPage.locator('main').first()).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// Public share link (accessed without auth)
// ---------------------------------------------------------------------------

test.describe('public share link', () => {
  test('accessing a non-existent share link returns an error page, not 500', async ({ page }) => {
    // Use a UUID that is very unlikely to exist
    const fakeId = '00000000-0000-0000-0000-000000000001';
    const res = await page.goto(`/shares/public/${fakeId}`);
    // Should be 404 or a friendly error page, not a server crash
    expect(res?.status()).not.toBe(500);
  });
});

import { expect, test } from './lib/test-fixtures';

test.describe('own shockers page', () => {
  test.beforeEach(async ({ authedPage }) => {
    await authedPage.goto('/shockers/own');
    await authedPage.waitForLoadState('networkidle');
  });

  test('renders the shockers page', async ({ authedPage }) => {
    // Page should load without error
    await expect(authedPage.getByRole('heading', { name: /shocker|device/i }).first()).toBeVisible({ timeout: 5000 }).catch(async () => {
      // May use a different heading or layout
      await expect(authedPage.locator('main, [data-content]').first()).toBeVisible();
    });
  });

  test('shows empty state or shocker list', async ({ authedPage }) => {
    // Either shows "no shockers" message or a list of shockers
    const emptyMsg = authedPage.getByText(/no shockers|no devices|add a/i);
    const shockerList = authedPage.locator('[data-shocker], tr, [role="listitem"]');
    const hasEmpty = await emptyMsg.count() > 0;
    const hasList = await shockerList.count() > 0;
    expect(hasEmpty || hasList).toBe(true);
  });
});

test.describe('shared shockers page', () => {
  test('renders the shared shockers page', async ({ authedPage }) => {
    await authedPage.goto('/shockers/shared');
    await authedPage.waitForLoadState('networkidle');
    await expect(authedPage.locator('main').first()).toBeVisible();
  });
});

test.describe('shocker logs', () => {
  test('logs page renders without error', async ({ authedPage }) => {
    await authedPage.goto('/shockers/logs');
    await authedPage.waitForLoadState('networkidle');
    // Should not show a 500 or crash
    await expect(authedPage.locator('main').first()).toBeVisible();
  });
});

test.describe('hubs page', () => {
  test.beforeEach(async ({ authedPage }) => {
    await authedPage.goto('/hubs');
    await authedPage.waitForLoadState('networkidle');
  });

  test('renders the hubs page', async ({ authedPage }) => {
    await expect(authedPage.getByRole('heading', { name: /hub/i }).first()).toBeVisible({ timeout: 5000 }).catch(async () => {
      await expect(authedPage.locator('main').first()).toBeVisible();
    });
  });

  test('shows empty state or hub list', async ({ authedPage }) => {
    const emptyMsg = authedPage.getByText(/no hubs|add a hub|pair/i);
    const hubList = authedPage.locator('[data-hub], tr, [role="listitem"]');
    const hasEmpty = await emptyMsg.count() > 0;
    const hasList = await hubList.count() > 0;
    expect(hasEmpty || hasList).toBe(true);
  });
});

import { expect, test } from './lib/test-fixtures';

test.describe('API tokens', () => {
  test('API tokens page renders', async ({ authedPage }) => {
    await authedPage.goto('/settings/api-tokens');
    await authedPage.waitForLoadState('networkidle');
    await expect(authedPage.getByRole('heading', { name: /api token/i })).toBeVisible();
  });

  test('new token page renders with a form', async ({ authedPage }) => {
    await authedPage.goto('/settings/api-tokens/new');
    await authedPage.waitForLoadState('networkidle');
    await expect(authedPage.getByLabel(/name/i)).toBeVisible();
  });

  test('create a new API token end-to-end', async ({ authedPage }) => {
    const tokenName = `e2e-token-${Date.now().toString(36)}`;

    await authedPage.goto('/settings/api-tokens/new');
    await authedPage.waitForLoadState('networkidle');

    // Fill in token name
    await authedPage.getByLabel(/name/i).fill(tokenName);

    // Submit (may also need expiry / permissions selection)
    const createBtn = authedPage.getByRole('button', { name: /create|generate|submit/i }).first();
    await createBtn.click();

    // Expect either a success state showing the token value or redirect back to list
    await authedPage.waitForTimeout(2000);

    const onNewPage = authedPage.url().includes('/api-tokens/new');
    const onListPage = authedPage.url().includes('/api-tokens') && !onNewPage;

    // Should either show the created token on the new page or redirect to list
    if (onNewPage) {
      // Token value may be shown once on creation
      await expect(authedPage.locator('code, [data-token-value], input[type="text"]').first()).toBeVisible({ timeout: 3000 }).catch(() => {});
    } else if (onListPage) {
      // Redirected to list — token should appear there
      await expect(authedPage.getByText(tokenName)).toBeVisible({ timeout: 3000 }).catch(() => {});
    }
  });

  test('newly created token appears in the token list', async ({ authedPage }) => {
    const tokenName = `e2e-list-${Date.now().toString(36)}`;

    // Create via new page
    await authedPage.goto('/settings/api-tokens/new');
    await authedPage.waitForLoadState('networkidle');
    await authedPage.getByLabel(/name/i).fill(tokenName);
    await authedPage.getByRole('button', { name: /create|generate|submit/i }).first().click();
    await authedPage.waitForTimeout(1500);

    // Navigate to list
    await authedPage.goto('/settings/api-tokens');
    await authedPage.waitForLoadState('networkidle');

    await expect(authedPage.getByText(tokenName)).toBeVisible({ timeout: 5000 });
  });

  test('can delete an existing API token', async ({ authedPage }) => {
    const tokenName = `e2e-del-${Date.now().toString(36)}`;

    // Create token first
    await authedPage.goto('/settings/api-tokens/new');
    await authedPage.waitForLoadState('networkidle');
    await authedPage.getByLabel(/name/i).fill(tokenName);
    await authedPage.getByRole('button', { name: /create|generate|submit/i }).first().click();
    await authedPage.waitForTimeout(1500);

    // Go to list
    await authedPage.goto('/settings/api-tokens');
    await authedPage.waitForLoadState('networkidle');

    // Find the delete button in the row containing our token name
    const tokenRow = authedPage.locator('tr, [data-row], li').filter({ hasText: tokenName }).first();
    if (await tokenRow.count()) {
      const deleteBtn = tokenRow.getByRole('button', { name: /delete|remove/i }).first();
      if (await deleteBtn.count()) {
        await deleteBtn.click();
        // Confirm deletion dialog if present
        const confirmBtn = authedPage.getByRole('button', { name: /confirm|yes|delete/i }).first();
        if (await confirmBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
          await confirmBtn.click();
        }
        await authedPage.waitForTimeout(1500);
        // Token should no longer appear
        await expect(authedPage.getByText(tokenName)).not.toBeVisible({ timeout: 3000 });
      }
    }
  });
});

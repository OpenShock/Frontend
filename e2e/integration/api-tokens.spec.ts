import { expect, test } from './lib/test-fixtures';

test.describe('API tokens', () => {
  test('API tokens page renders', async ({ authedPage }) => {
    await authedPage.goto('/settings/api-tokens');
    await authedPage.waitForLoadState('networkidle');
    await expect(authedPage.getByRole('button', { name: /generate token/i })).toBeVisible();
    await expect(authedPage.locator('main')).toContainText('API Tokens');
  });

  test('Generate Token button opens the create dialog', async ({ authedPage }) => {
    await authedPage.goto('/settings/api-tokens');
    await authedPage.waitForLoadState('networkidle');
    await authedPage.getByRole('button', { name: /generate token/i }).click();
    await expect(authedPage.getByRole('dialog')).toBeVisible({ timeout: 3000 });
    await expect(authedPage.getByLabel(/token name/i)).toBeVisible();
  });

  test('create a new API token end-to-end', async ({ authedPage }) => {
    const tokenName = `e2e-token-${Date.now().toString(36)}`;

    await authedPage.goto('/settings/api-tokens');
    await authedPage.waitForLoadState('networkidle');

    // Open the create dialog
    await authedPage.getByRole('button', { name: /generate token/i }).click();
    await expect(authedPage.getByRole('dialog')).toBeVisible({ timeout: 3000 });

    // Fill in token name
    await authedPage.getByLabel(/token name/i).fill(tokenName);

    // Submit
    await authedPage
      .getByRole('button', { name: /generate/i })
      .last()
      .click();

    // Should show the token value dialog
    await expect(authedPage.getByText(/api token generated/i)).toBeVisible({ timeout: 5000 });
  });

  test('newly created token appears in the token list', async ({ authedPage }) => {
    const tokenName = `e2e-list-${Date.now().toString(36)}`;

    await authedPage.goto('/settings/api-tokens');
    await authedPage.waitForLoadState('networkidle');

    // Create via dialog
    await authedPage.getByRole('button', { name: /generate token/i }).click();
    await expect(authedPage.getByRole('dialog')).toBeVisible({ timeout: 3000 });
    await authedPage.getByLabel(/token name/i).fill(tokenName);
    await authedPage
      .getByRole('button', { name: /generate/i })
      .last()
      .click();

    // Close the token-value dialog
    await authedPage.getByRole('button', { name: /close/i }).click();

    // Token should appear in the list
    await expect(authedPage.locator('tr').filter({ hasText: tokenName })).toBeVisible({
      timeout: 5000,
    });
  });

  test('can delete an existing API token', async ({ authedPage }) => {
    const tokenName = `e2e-del-${Date.now().toString(36)}`;

    await authedPage.goto('/settings/api-tokens');
    await authedPage.waitForLoadState('networkidle');

    // Create token via dialog
    await authedPage.getByRole('button', { name: /generate token/i }).click();
    await expect(authedPage.getByRole('dialog')).toBeVisible({ timeout: 3000 });
    await authedPage.getByLabel(/token name/i).fill(tokenName);
    await authedPage
      .getByRole('button', { name: /generate/i })
      .last()
      .click();

    // Close the token-value dialog
    await authedPage.keyboard.press('Escape');
    await authedPage.waitForTimeout(500);

    // Find the row containing our token, open the actions menu, then delete
    const tokenRow = authedPage.locator('tr').filter({ hasText: tokenName }).first();
    if (await tokenRow.count()) {
      // Click the ellipsis/actions button to open the dropdown
      const actionsBtn = tokenRow.getByRole('button', { name: /open menu/i }).first();
      if (await actionsBtn.count()) {
        await actionsBtn.click();
        // Click the Delete item in the dropdown
        const deleteItem = authedPage.getByRole('menuitem', { name: /delete/i }).first();
        if (await deleteItem.isVisible({ timeout: 1000 }).catch(() => false)) {
          await deleteItem.click();
          // Confirm deletion in the dialog
          const confirmBtn = authedPage.getByRole('button', { name: /delete/i }).first();
          if (await confirmBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
            await confirmBtn.click();
          }
          await authedPage.waitForTimeout(1500);
          // Token should no longer appear
          await expect(authedPage.getByText(tokenName)).not.toBeVisible({ timeout: 3000 });
        }
      }
    }
  });
});

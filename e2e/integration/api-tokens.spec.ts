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

    // Close the token-value dialog (Escape is unreliable with the overlay; use the close button)
    await authedPage.getByRole('button', { name: /close/i }).click();
    await expect(authedPage.getByRole('dialog')).toHaveCount(0, { timeout: 3000 });

    // Find the row containing our token, open the actions menu, then delete
    const tokenRow = authedPage.locator('tr').filter({ hasText: tokenName }).first();
    await expect(tokenRow).toBeVisible();

    // TableActionMenu's trigger carries an sr-only "Open menu" label.
    const actionsBtn = tokenRow.getByRole('button', { name: /open menu/i }).first();
    await expect(actionsBtn).toBeVisible();
    await actionsBtn.click();

    const deleteItem = authedPage.getByRole('menuitem', { name: /delete/i }).first();
    await expect(deleteItem).toBeVisible();
    await deleteItem.click();

    const confirmBtn = authedPage
      .getByRole('dialog')
      .getByRole('button', { name: /delete/i })
      .first();
    await expect(confirmBtn).toBeVisible();
    await confirmBtn.click();

    await expect(authedPage.getByText(tokenName)).toHaveCount(0, { timeout: 5000 });
  });
});

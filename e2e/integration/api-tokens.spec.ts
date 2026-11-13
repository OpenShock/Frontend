import type { Page } from '@playwright/test';
import { expect, test } from './lib/test-fixtures';

// Token creation is a dedicated page (/settings/api-tokens/new), not a dialog. The list page
// links there with "Generate Token"; the form's submit button is just "Generate".
async function createToken(page: Page, tokenName: string): Promise<void> {
  await page.goto('/settings/api-tokens/new');
  await page.waitForLoadState('networkidle');
  await page.getByLabel(/token name/i).fill(tokenName);
  await page.getByRole('button', { name: /^generate$/i }).click();
  await expect(page.getByText(/api token generated/i)).toBeVisible({ timeout: 5000 });
}

// The token list is a stack of divs, not a table. The row is the innermost div that holds
// both the token's name and its action menu: the name's own wrapper has no button and the
// actions wrapper has no name, and ancestors come first in document order, so `.last()`
// is the row.
function tokenRow(page: Page, tokenName: string) {
  return page
    .getByRole('main')
    .locator('div')
    .filter({ has: page.getByText(tokenName, { exact: true }) })
    .filter({ has: page.getByRole('button', { name: /open menu/i }) })
    .last();
}

test.describe('API tokens', () => {
  test('API tokens page renders', async ({ authedPage }) => {
    await authedPage.goto('/settings/api-tokens');
    await authedPage.waitForLoadState('networkidle');
    await expect(authedPage.getByRole('link', { name: /generate token/i })).toBeVisible();
    await expect(authedPage.locator('main')).toContainText('API Tokens');
  });

  test('Generate Token button opens the create page', async ({ authedPage }) => {
    await authedPage.goto('/settings/api-tokens');
    await authedPage.waitForLoadState('networkidle');
    await authedPage.getByRole('link', { name: /generate token/i }).click();
    await expect(authedPage).toHaveURL(/\/settings\/api-tokens\/new$/);
    await expect(authedPage.getByRole('heading', { name: /new api token/i })).toBeVisible();
    await expect(authedPage.getByLabel(/token name/i)).toBeVisible();
  });

  test('create a new API token end-to-end', async ({ authedPage }) => {
    const tokenName = `e2e-token-${Date.now().toString(36)}`;
    await createToken(authedPage, tokenName);
  });

  test('newly created token appears in the token list', async ({ authedPage }) => {
    const tokenName = `e2e-list-${Date.now().toString(36)}`;
    await createToken(authedPage, tokenName);

    // "Done" leads back to the list.
    await authedPage.getByRole('link', { name: /^done$/i }).click();
    await expect(authedPage).toHaveURL(/\/settings\/api-tokens$/);
    await expect(authedPage.getByRole('main').getByText(tokenName, { exact: true })).toBeVisible({
      timeout: 5000,
    });
  });

  test('can delete an existing API token', async ({ authedPage }) => {
    const tokenName = `e2e-del-${Date.now().toString(36)}`;
    await createToken(authedPage, tokenName);

    await authedPage.getByRole('link', { name: /^done$/i }).click();
    await expect(authedPage).toHaveURL(/\/settings\/api-tokens$/);

    const row = tokenRow(authedPage, tokenName);
    await expect(row).toBeVisible();

    // TableActionMenu's trigger carries an sr-only "Open menu" label.
    await row.getByRole('button', { name: /open menu/i }).click();

    const deleteItem = authedPage.getByRole('menuitem', { name: /delete/i });
    await expect(deleteItem).toBeVisible();
    await deleteItem.click();

    const confirmBtn = authedPage.getByRole('dialog').getByRole('button', { name: /^delete$/i });
    await expect(confirmBtn).toBeVisible();
    await confirmBtn.click();

    await expect(authedPage.getByRole('main').getByText(tokenName, { exact: true })).toHaveCount(
      0,
      { timeout: 5000 }
    );
  });
});

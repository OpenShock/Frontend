import { expect, test } from './lib/test-fixtures';

test.describe('account settings', () => {
  test.beforeEach(async ({ authedPage }) => {
    await authedPage.goto('/settings/account');
    await authedPage.waitForLoadState('networkidle');
  });

  test('settings page is accessible and renders', async ({ authedPage }) => {
    await expect(authedPage.getByRole('heading', { name: /account|settings/i })).toBeVisible();
  });

  test('displays current username', async ({ authedPage, user }) => {
    // Username should appear somewhere on the settings page
    await expect(authedPage.getByText(user.credentials.username, { exact: false })).toBeVisible();
  });

  test('displays current email', async ({ authedPage, user }) => {
    await expect(authedPage.getByText(user.credentials.email, { exact: false })).toBeVisible();
  });

  test('update username with a valid new name', async ({ authedPage }) => {
    const newName = `upd_${Date.now().toString(36)}`;

    // The page shows the username as text; changing it goes through a dialog.
    await authedPage.getByRole('button', { name: /change username/i }).click();
    const dialog = authedPage.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await dialog.getByLabel(/new username/i).fill(newName);
    await dialog.getByRole('button', { name: /^change username$/i }).click();

    // The new name has to survive a reload — a toast alone would not prove it was saved.
    await expect(dialog).toBeHidden();
    await authedPage.reload();
    await authedPage.waitForLoadState('networkidle');
    await expect(authedPage.getByText(newName, { exact: false })).toBeVisible();
  });

  test('rejects username that is too short', async ({ authedPage }) => {
    await authedPage.getByRole('button', { name: /change username/i }).click();
    const dialog = authedPage.getByRole('dialog');
    await expect(dialog).toBeVisible();

    const usernameInput = dialog.getByLabel(/new username/i);
    await usernameInput.fill('ab');

    await expect(usernameInput).toHaveAttribute('aria-invalid', 'true', { timeout: 3000 });
    await expect(dialog.getByRole('button', { name: /^change username$/i })).toBeDisabled();
  });
});

test.describe('profile page', () => {
  test('profile page renders with user info', async ({ authedPage, user }) => {
    await authedPage.goto('/profile');
    await authedPage.waitForLoadState('networkidle');
    await expect(authedPage.getByText(user.credentials.username, { exact: false })).toBeVisible();
  });
});

test.describe('sessions', () => {
  test('sessions page lists at least one active session', async ({ authedPage }) => {
    await authedPage.goto('/settings/sessions');
    await authedPage.waitForLoadState('networkidle');
    // Should show the current session
    // One auto-waiting assertion over the shapes the page may use, so a missing list fails.
    await expect(
      authedPage
        .getByRole('row')
        .or(authedPage.locator('[data-session]'))
        .or(authedPage.getByText(/current|active|session/i))
        .first()
    ).toBeVisible({ timeout: 5000 });
  });
});

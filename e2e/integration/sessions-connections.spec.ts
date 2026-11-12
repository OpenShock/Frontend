import { expect, test } from './lib/test-fixtures';

test.describe('sessions page', () => {
  test('renders the sessions management page', async ({ authedPage }) => {
    await authedPage.goto('/settings/sessions');
    await authedPage.waitForLoadState('networkidle');
    await expect(authedPage.locator('main').first()).toBeVisible();
  });

  test('shows at least one active session (the current one)', async ({ authedPage }) => {
    await authedPage.goto('/settings/sessions');
    await authedPage.waitForLoadState('networkidle');
    // Each session renders as a div with a "Signed in ..." line; the current session is
    // always present, so at least one must show.
    await expect(
      authedPage
        .getByRole('main')
        .getByText(/signed in/i)
        .first()
    ).toBeVisible({
      timeout: 5000,
    });
  });

  test('session list shows an IP address or device info', async ({ authedPage }) => {
    await authedPage.goto('/settings/sessions');
    await authedPage.waitForLoadState('networkidle');
    // The current session must be identifiable — assert either layout-cell info
    // or a recognizable IPv4 pattern is present somewhere on the page.
    // The current session must be identifiable: its line carries the client IP, which the
    // harness reaches over the docker bridge (IPv4, possibly IPv6-mapped) or loopback.
    await expect(
      authedPage
        .getByRole('main')
        .getByText(/\b\d{1,3}(\.\d{1,3}){3}\b|::1|localhost/i)
        .first()
    ).toBeVisible({ timeout: 5000 });
  });
});

test.describe('connections / OAuth page', () => {
  test('renders the connections settings page', async ({ authedPage }) => {
    await authedPage.goto('/settings/connections');
    await authedPage.waitForLoadState('networkidle');
    await expect(authedPage.locator('main').first()).toBeVisible();
  });

  test('shows available OAuth providers or an empty state', async ({ authedPage }) => {
    await authedPage.goto('/settings/connections');
    await authedPage.waitForLoadState('networkidle');
    // Either provider UI is present, or an empty/none-configured state is shown.
    // Both are acceptable — what's not acceptable is rendering nothing at all.
    const providerVisible = await authedPage
      .getByText(/discord|github|google|oauth|provider/i)
      .first()
      .isVisible({ timeout: 5000 })
      .catch(() => false);
    if (!providerVisible) {
      await expect(
        authedPage
          .getByText(/no.*(provider|connection|configured)|none\s*(available|configured)/i)
          .first()
      ).toBeVisible({ timeout: 5000 });
    }
  });
});

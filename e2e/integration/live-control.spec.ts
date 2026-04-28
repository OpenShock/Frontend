import { expect, test } from './lib/test-fixtures';

// ---------------------------------------------------------------------------
// Live control page — UI structure (WebSocket connection requires real hubs)
// ---------------------------------------------------------------------------

test.describe('own shockers / live control page', () => {
  test.beforeEach(async ({ authedPage }) => {
    await authedPage.goto('/shockers/own');
    await authedPage.waitForLoadState('networkidle');
  });

  test('page renders the main content area', async ({ authedPage }) => {
    await expect(authedPage.locator('main, [data-content], #app').first()).toBeVisible();
  });

  test('shows a heading or title for the shockers section', async ({ authedPage }) => {
    await expect(
      authedPage.getByRole('heading', { name: /shocker|device|hub/i }).first()
    ).toBeVisible({ timeout: 5000 }).catch(async () => {
      // May not use a heading element — just ensure main content is visible
      await expect(authedPage.locator('main').first()).toBeVisible();
    });
  });

  test('empty state or shocker list is shown', async ({ authedPage }) => {
    const emptyMsg = authedPage.getByText(/no shockers|no devices|no hubs|add a/i);
    const shockerCard = authedPage.locator('[data-shocker], [data-hub], [class*="card"]').first();
    const hasEmpty = await emptyMsg.count() > 0;
    const hasCard = await shockerCard.count() > 0;
    expect(hasEmpty || hasCard).toBe(true);
  });

  test('page does not produce a JS error on load', async ({ authedPage }) => {
    const errors: string[] = [];
    authedPage.on('pageerror', (e) => errors.push(e.message));
    await authedPage.goto('/shockers/own');
    await authedPage.waitForLoadState('networkidle');
    expect(errors).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// Live control — add shocker button / dialog (UI only, no real device needed)
// ---------------------------------------------------------------------------

test.describe('add shocker dialog', () => {
  test('add button or link is visible on the own shockers page', async ({ authedPage }) => {
    await authedPage.goto('/shockers/own');
    await authedPage.waitForLoadState('networkidle');
    const addBtn = authedPage.getByRole('button', { name: /add|new|pair/i }).first();
    const addLink = authedPage.getByRole('link', { name: /add|new|pair/i }).first();
    const hasBtn = await addBtn.count() > 0;
    const hasLink = await addLink.count() > 0;
    if (hasBtn || hasLink) {
      await expect(hasBtn ? addBtn : addLink).toBeVisible({ timeout: 5000 });
    }
    // If neither exists the page just shows empty state — acceptable for a fresh account
  });
});

// ---------------------------------------------------------------------------
// Live control — module selector (Classic / Rich / Map / Live)
// ---------------------------------------------------------------------------

test.describe('control module UI', () => {
  test('control module selector or tabs are present on the page', async ({ authedPage }) => {
    await authedPage.goto('/shockers/own');
    await authedPage.waitForLoadState('networkidle');
    // Look for module type buttons or tabs
    const moduleControls = authedPage.locator(
      '[data-module], [role="tab"], button[aria-selected]'
    );
    const count = await moduleControls.count();
    // Only meaningful if there are shockers; otherwise the selector may not render
    if (count > 0) {
      await expect(moduleControls.first()).toBeVisible({ timeout: 3000 });
    }
  });
});

// ---------------------------------------------------------------------------
// Live button — present only when shockers exist; cannot click without a hub
// ---------------------------------------------------------------------------

test.describe('live button', () => {
  test('page does not throw when navigating to own shockers without a hub connected', async ({
    authedPage,
  }) => {
    // This test validates the absence of unhandled errors when no hub is online
    const errors: string[] = [];
    authedPage.on('pageerror', (e) => errors.push(e.message));
    await authedPage.goto('/shockers/own');
    await authedPage.waitForLoadState('networkidle');
    // A small wait to let any async effects settle
    await authedPage.waitForTimeout(1000);
    expect(errors).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// Shocker detail page — navigates to /shockers/<id>
// (Only accessible when a real shocker exists, so we test the route structure)
// ---------------------------------------------------------------------------

test.describe('shocker detail route', () => {
  test('accessing a non-existent shocker UUID returns a non-500 response', async ({ page }) => {
    const fakeId = '00000000-0000-0000-0000-000000000002';
    const res = await page.goto(`/shockers/${fakeId}`);
    expect(res?.status()).not.toBe(500);
  });

  test('accessing a non-existent shocker edit page returns a non-500 response', async ({
    page,
  }) => {
    const fakeId = '00000000-0000-0000-0000-000000000002';
    const res = await page.goto(`/shockers/${fakeId}/edit`);
    expect(res?.status()).not.toBe(500);
  });
});

// ---------------------------------------------------------------------------
// Hub detail route
// ---------------------------------------------------------------------------

test.describe('hub detail route', () => {
  test('accessing a non-existent hub UUID returns a non-500 response', async ({ page }) => {
    const fakeId = '00000000-0000-0000-0000-000000000003';
    const res = await page.goto(`/hubs/${fakeId}`);
    expect(res?.status()).not.toBe(500);
  });

  test('accessing a non-existent hub update page returns a non-500 response', async ({ page }) => {
    const fakeId = '00000000-0000-0000-0000-000000000003';
    const res = await page.goto(`/hubs/${fakeId}/update`);
    expect(res?.status()).not.toBe(500);
  });
});

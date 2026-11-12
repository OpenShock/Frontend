import { expect, test } from './lib/test-fixtures';

// ---------------------------------------------------------------------------
// SignalR / realtime — these tests validate that the frontend establishes a
// SignalR connection when authenticated and that the UI reacts gracefully to
// connection lifecycle events.  Full end-to-end realtime messaging requires a
// hub device, so most tests here focus on the connection-establishment path
// and UI state rather than incoming messages.
// ---------------------------------------------------------------------------

test.describe('SignalR connection lifecycle', () => {
  test('no WebSocket / SignalR errors appear on the home page', async ({ authedPage }) => {
    const errors: string[] = [];
    authedPage.on('pageerror', (e) => errors.push(e.message));

    await authedPage.goto('/home');
    await authedPage.waitForLoadState('networkidle');
    // Allow a moment for async connection attempts to settle
    await authedPage.waitForTimeout(2000);

    // Filter out noise unrelated to SignalR
    const signarErrors = errors.filter((e) => /signalr|websocket|hub|negotiate/i.test(e));
    expect(signarErrors).toHaveLength(0);
  });

  test('no uncaught errors on shockers page (SignalR + live-control init)', async ({
    authedPage,
  }) => {
    const errors: string[] = [];
    authedPage.on('pageerror', (e) => errors.push(e.message));

    await authedPage.goto('/shockers/own');
    await authedPage.waitForLoadState('networkidle');
    await authedPage.waitForTimeout(2000);

    expect(errors).toHaveLength(0);
  });

  test('authenticated page opens the user hub WebSocket and completes the handshake', async ({
    authedPage,
  }) => {
    // The client is WebSockets-only with negotiation skipped, so the hub URL is the one and
    // only socket. Matching request URLs is not enough: in dev mode the signalr JS chunk's URL
    // matches too, and an upgrade the proxy drops never shows up as a failed request.
    const socket = authedPage.waitForEvent('websocket', {
      predicate: (ws) => /\/1\/hubs\/user/.test(ws.url()),
      timeout: 15000,
    });
    await authedPage.goto('/home');
    const ws = await socket;

    // SignalR's handshake is the first exchange on the socket: the client sends its protocol,
    // the server answers. A received frame therefore proves the upgrade was forwarded and the
    // hub accepted the session cookie.
    await ws.waitForEvent('framereceived', { timeout: 10000 });
    expect(ws.isClosed()).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Hub status — visual indicators (requires no physical hub)
// ---------------------------------------------------------------------------

test.describe('hub status UI', () => {
  test('hubs page renders without errors after SignalR init', async ({ authedPage }) => {
    const errors: string[] = [];
    authedPage.on('pageerror', (e) => errors.push(e.message));

    await authedPage.goto('/hubs');
    await authedPage.waitForLoadState('networkidle');
    await authedPage.waitForTimeout(1500);

    await expect(authedPage.locator('main').first()).toBeVisible();
    expect(errors).toHaveLength(0);
  });

  test('shocker logs page renders without SignalR errors', async ({ authedPage }) => {
    const errors: string[] = [];
    authedPage.on('pageerror', (e) => errors.push(e.message));

    await authedPage.goto('/shockers/logs');
    await authedPage.waitForLoadState('networkidle');
    await authedPage.waitForTimeout(1000);

    await expect(authedPage.locator('main').first()).toBeVisible();
    expect(errors).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// Realtime event listeners — cannot trigger without a device, but we can
// verify that the page subscribes correctly (no duplicate / leaked listeners)
// ---------------------------------------------------------------------------

test.describe('realtime subscription cleanup', () => {
  test('navigating between pages does not cause JS errors from stale listeners', async ({
    authedPage,
  }) => {
    const errors: string[] = [];
    authedPage.on('pageerror', (e) => errors.push(e.message));

    // Navigate through several pages that set up realtime listeners
    await authedPage.goto('/home');
    await authedPage.waitForLoadState('networkidle');

    await authedPage.goto('/shockers/own');
    await authedPage.waitForLoadState('networkidle');

    await authedPage.goto('/hubs');
    await authedPage.waitForLoadState('networkidle');

    await authedPage.goto('/home');
    await authedPage.waitForLoadState('networkidle');

    await authedPage.waitForTimeout(1000);
    expect(errors).toHaveLength(0);
  });
});

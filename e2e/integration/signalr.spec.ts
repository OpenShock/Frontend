import type { Page, WebSocket } from '@playwright/test';
import { expect, test } from './lib/test-fixtures';

// ---------------------------------------------------------------------------
// SignalR / realtime — these tests validate that the frontend establishes a
// SignalR connection when authenticated and that the UI reacts gracefully to
// connection lifecycle events.  Full end-to-end realtime messaging requires a
// hub device, so most tests here focus on the connection-establishment path
// and UI state rather than incoming messages.
// ---------------------------------------------------------------------------

const USER_HUB = /\/1\/hubs\/user/;

/**
 * Resolves with the user hub socket once the server has answered on it.
 *
 * The client is WebSockets-only with negotiation skipped, so the hub URL is the one and only
 * socket. SignalR's handshake is the first exchange on it: the client sends its protocol, the
 * server answers. A received frame therefore proves the upgrade was forwarded and the hub
 * accepted the session cookie - which is the point realtime is actually up, and what the
 * error checks below have to wait for. A fixed delay only hopes it has happened by then.
 *
 * Call this BEFORE navigating: the frame wait is chained off the socket event so it is in
 * place as soon as the socket exists, and frames are not replayed to late listeners.
 */
function userHubReady(page: Page): Promise<WebSocket> {
  return page
    .waitForEvent('websocket', { predicate: (ws) => USER_HUB.test(ws.url()), timeout: 15000 })
    .then(async (ws) => {
      await ws.waitForEvent('framereceived', { timeout: 10000 });
      return ws;
    });
}

/** Loads `path` and waits until the page is idle and the user hub has completed its handshake. */
async function gotoWithHub(page: Page, path: string): Promise<WebSocket> {
  const hub = userHubReady(page);
  await page.goto(path);
  await page.waitForLoadState('networkidle');
  return hub;
}

test.describe('SignalR connection lifecycle', () => {
  test('no WebSocket / SignalR errors appear on the home page', async ({ authedPage }) => {
    const errors: string[] = [];
    authedPage.on('pageerror', (e) => errors.push(e.message));

    await gotoWithHub(authedPage, '/home');

    // Filter out noise unrelated to SignalR
    const signarErrors = errors.filter((e) => /signalr|websocket|hub|negotiate/i.test(e));
    expect(signarErrors).toHaveLength(0);
  });

  test('no uncaught errors on shockers page (SignalR + live-control init)', async ({
    authedPage,
  }) => {
    const errors: string[] = [];
    authedPage.on('pageerror', (e) => errors.push(e.message));

    await gotoWithHub(authedPage, '/shockers/own');

    expect(errors).toHaveLength(0);
  });

  test('authenticated page opens the user hub WebSocket and completes the handshake', async ({
    authedPage,
  }) => {
    // Matching request URLs is not enough: in dev mode the signalr JS chunk's URL matches too,
    // and an upgrade the proxy drops never shows up as a failed request.
    const ws = await gotoWithHub(authedPage, '/home');
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

    await gotoWithHub(authedPage, '/hubs');

    await expect(authedPage.locator('main').first()).toBeVisible();
    expect(errors).toHaveLength(0);
  });

  test('shocker logs page renders without SignalR errors', async ({ authedPage }) => {
    const errors: string[] = [];
    authedPage.on('pageerror', (e) => errors.push(e.message));

    await gotoWithHub(authedPage, '/shockers/logs');

    await expect(authedPage.locator('main').first()).toBeVisible();
    expect(errors).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// Realtime event listeners — cannot trigger an event without a device, but we
// can verify that moving between pages inside the running app neither throws
// from a stale listener nor tears down / duplicates the hub connection.
// ---------------------------------------------------------------------------

test.describe('realtime subscription cleanup', () => {
  test('navigating between pages does not cause JS errors from stale listeners', async ({
    authedPage,
  }) => {
    const errors: string[] = [];
    authedPage.on('pageerror', (e) => errors.push(e.message));

    let hubSockets = 0;
    authedPage.on('websocket', (ws) => {
      if (USER_HUB.test(ws.url())) hubSockets++;
    });

    const hub = await gotoWithHub(authedPage, '/home');

    // Move through pages that set up realtime listeners using the sidebar, so each transition
    // is a client-side route change: the document stays alive and the previous page's
    // listeners really are unmounted. page.goto() would load a fresh document every time and
    // exercise no cleanup at all.
    const sidebarLink = (name: string) => authedPage.getByRole('link', { name, exact: true });

    await sidebarLink('Shockers').click();
    await expect(authedPage).toHaveURL(/\/shockers\/own$/);
    await authedPage.waitForLoadState('networkidle');

    await sidebarLink('Hubs').click();
    await expect(authedPage).toHaveURL(/\/hubs$/);
    await authedPage.waitForLoadState('networkidle');

    await sidebarLink('Home').click();
    await expect(authedPage).toHaveURL(/\/home$/);
    await authedPage.waitForLoadState('networkidle');

    // One hub socket for the whole journey, still open: the transitions were in-app (a full
    // reload would have opened another) and no page tore the shared connection down.
    expect(hubSockets).toBe(1);
    expect(hub.isClosed()).toBe(false);
    expect(errors).toHaveLength(0);
  });
});

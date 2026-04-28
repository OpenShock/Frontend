import { test as base, type BrowserContext, type Page } from '@playwright/test';
import { BACKEND_URL, FRONTEND_URL, MAILPIT_URL } from './env';
import { deleteSelf, type AuthCookies } from './api-client';

// ---------------------------------------------------------------------------
// Unique ID helpers
// ---------------------------------------------------------------------------

function uniqueId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export type Credentials = {
  username: string;
  email: string;
  password: string;
};

export function makeCredentials(prefix = 'e2e'): Credentials {
  const id = uniqueId();
  return {
    username: `${prefix}_${id}`.slice(0, 32),
    email: `${prefix}_${id}@e2e.openshock.test`,
    password: `Password!${id}A1`,
  };
}

// ---------------------------------------------------------------------------
// Turnstile bypass
//
// Strategy for backends without captcha enforcement (e.g. next.openshock.dev):
//
//   1. Route-intercept GET <BACKEND_URL>/1 and inject turnstileSiteKey='e2e-key'
//      so the Svelte Turnstile component proceeds past the early-return guard.
//   2. Inject window.turnstile mock via addInitScript so the component's
//      window.turnstile.ready() → render() path auto-fires the callback.
//
// The backend accepts any turnstile value (captcha not enforced), so the fake
// token 'e2e-bypass' passes server-side validation.
// ---------------------------------------------------------------------------

const TURNSTILE_MOCK_SCRIPT = `
window.__e2eTurnstileMocked = true;
window.turnstile = {
  ready(fn) { fn(); },
  render(el, params) {
    // Fire the callback asynchronously so the component finishes mounting first
    setTimeout(() => {
      if (typeof params.callback === 'function') params.callback('e2e-bypass');
    }, 50);
    return 'e2e-mock-widget';
  },
  remove() {},
  reset() {},
};
`;

async function applyTurnstileBypass(context: BrowserContext): Promise<void> {
  // Inject the turnstile mock into every page in the context
  await context.addInitScript(TURNSTILE_MOCK_SCRIPT);

  // Intercept the backend-info endpoint and ensure turnstileSiteKey is non-null
  // so the component doesn't return early before calling window.turnstile.ready()
  await context.route(`${BACKEND_URL}/1`, async (route) => {
    const response = await route.fetch();
    let body: Record<string, unknown>;
    try {
      body = await response.json();
    } catch {
      return route.continue();
    }

    // Patch turnstileSiteKey in the nested data object
    if (body && typeof body === 'object' && 'data' in body) {
      const data = body.data as Record<string, unknown>;
      if (!data.turnstileSiteKey) {
        data.turnstileSiteKey = 'e2e-key';
      }
    }

    await route.fulfill({
      status: response.status(),
      headers: Object.fromEntries(Object.entries(response.headers())),
      body: JSON.stringify(body),
    });
  });
}

// ---------------------------------------------------------------------------
// Cookie helpers (for teardown)
// ---------------------------------------------------------------------------

async function getAuthCookies(context: BrowserContext): Promise<AuthCookies> {
  const cookies = await context.cookies();
  const apiHost = new URL(BACKEND_URL).hostname;
  return cookies
    .filter((c) => c.domain.includes(apiHost) || c.domain.includes('openshock'))
    .map((c) => `${c.name}=${c.value}; Path=${c.path}; Domain=${c.domain}`);
}

// ---------------------------------------------------------------------------
// Browser-based login helper (the actual E2E action)
// ---------------------------------------------------------------------------

export async function loginViaBrowser(page: Page, creds: Credentials): Promise<void> {
  await page.goto('/login');
  await page.waitForLoadState('networkidle');

  // Wait until the form is ready (backend metadata loaded)
  await page.getByLabel(/username or email/i).waitFor({ state: 'visible', timeout: 10_000 });

  await page.getByLabel(/username or email/i).fill(creds.email);
  await page.getByLabel(/password/i).fill(creds.password);

  // Wait for the Turnstile mock to fire (enables the submit button)
  const loginBtn = page.getByRole('button', { name: /^login$/i });
  await loginBtn.waitFor({ state: 'attached' });
  await page.waitForFunction(
    () => {
      const btn = document.querySelector('button[type="submit"]') as HTMLButtonElement | null;
      return btn && !btn.disabled;
    },
    { timeout: 5_000 }
  );

  await loginBtn.click();
  // Wait for redirect to home (or any authenticated page)
  await page.waitForURL(/\/(home|shockers|hubs|settings)/, { timeout: 15_000 });
}

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

export const test = base.extend<{
  /** Raw credentials for a unique test account. */
  credentials: Credentials;
  /** Browser page with Turnstile bypass applied (not logged in). */
  page: Page;
  /** Browser page already logged in as a fresh user. Teardown deletes the account. */
  authedPage: Page;
  /** Whether MailPit is configured. Use test.skip(!mailpitEnabled) to gate email tests. */
  mailpitEnabled: boolean;
}>({
  // Extend the built-in page fixture to apply the Turnstile bypass
  page: async ({ context, page }, use) => {
    await applyTurnstileBypass(context);
    await use(page);
  },

  credentials: async ({}, use) => {
    await use(makeCredentials());
  },

  mailpitEnabled: async ({}, use) => {
    await use(MAILPIT_URL.length > 0);
  },

  authedPage: async ({ context, page, credentials }, use) => {
    await applyTurnstileBypass(context);

    // ---------------------------------------------------------------------------
    // Sign up via the browser (full E2E path, includes OAuth-button skip)
    // ---------------------------------------------------------------------------
    await page.goto('/signup');
    await page.waitForLoadState('networkidle');

    // If OAuth buttons are shown first, click through to email signup
    const emailBtn = page.getByRole('button', { name: /signup with email/i });
    if (await emailBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await emailBtn.click();
    }

    await page.getByLabel(/username/i).fill(credentials.username);
    await page.getByLabel(/^email$/i).fill(credentials.email);

    // Fill password fields — there are two (password + confirm)
    const pwFields = page.getByLabel(/password/i);
    await pwFields.nth(0).fill(credentials.password);
    await pwFields.nth(1).fill(credentials.password);

    // Wait for Turnstile bypass to enable the button
    await page.waitForFunction(
      () => {
        const btn = document.querySelector('button[type="submit"]') as HTMLButtonElement | null;
        return btn && !btn.disabled;
      },
      { timeout: 8_000 }
    );

    await page.getByRole('button', { name: /create account/i }).click();

    // Dismiss the "check your email" success dialog if it appears
    const okBtn = page.getByRole('button', { name: /^ok$/i });
    if (await okBtn.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await okBtn.click();
    }

    // ---------------------------------------------------------------------------
    // Log in via the browser
    // ---------------------------------------------------------------------------
    await loginViaBrowser(page, credentials);

    const cookies = await getAuthCookies(context);
    await use(page);

    // Teardown: delete the account
    try {
      const freshCookies = await getAuthCookies(context);
      await deleteSelf(freshCookies.length > 0 ? freshCookies : cookies);
    } catch (err) {
      console.warn('[e2e] teardown: account deletion failed:', err);
    }
  },
});

export { expect } from '@playwright/test';
export { FRONTEND_URL, BACKEND_URL, MAILPIT_URL };

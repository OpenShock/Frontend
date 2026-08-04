import { test as base, type BrowserContext, type Page } from '@playwright/test';
import {
  activateAccount,
  login as apiLogin,
  signup as apiSignup,
  deleteSelf,
  type AuthCookies,
  type Credentials,
} from './api-client';
import { FRONTEND_URL } from './env';

function uniqueId(): string {
  return `${Date.now().toString(36)}-${crypto.randomUUID().replace(/-/g, '').slice(0, 8)}`;
}

export function makeCredentials(prefix = 'pw'): Credentials {
  const id = uniqueId();
  return {
    username: `${prefix}_${id}`.slice(0, 32),
    email: `${prefix}_${id}@e2e.openshock.test`,
    password: `Password!${id}A1`,
  };
}

async function applyCookiesToContext(context: BrowserContext, cookies: AuthCookies): Promise<void> {
  const url = new URL(FRONTEND_URL);
  const apiHost = new URL(process.env.TEST_BACKEND_URL ?? 'http://localhost:5001').hostname;
  const parsed = cookies.flatMap((raw) => {
    const [pair, ...attrs] = raw.split(';').map((s) => s.trim());
    const [name, ...rest] = pair.split('=');
    if (!name || rest.length === 0) return [];
    const value = rest.join('=');
    const attrMap = Object.fromEntries(
      attrs.map((a) => {
        const [k, ...v] = a.split('=');
        return [k.toLowerCase(), v.join('=')];
      })
    );
    // The harness runs over plain HTTP, so a cookie can't be Secure (the browser
    // would drop it) and can't be SameSite=None (Chromium requires Secure for
    // None). Force a non-secure Lax/Strict cookie that survives the HTTP origin.
    const sameSite = attrMap['samesite']?.toLowerCase() === 'strict' ? 'Strict' : 'Lax';
    return [
      {
        name,
        value,
        domain: attrMap['domain'] ?? apiHost,
        path: attrMap['path'] ?? '/',
        httpOnly: 'httponly' in attrMap,
        secure: false,
        sameSite: sameSite as 'Lax' | 'Strict',
      },
    ];
  });
  await context.addCookies(parsed);
  // touch the URL so SvelteKit picks up state
  void url;
}

export type TestUser = {
  credentials: Credentials;
  cookies: AuthCookies;
};

export const test = base.extend<{
  user: TestUser;
  authedPage: Page;
}>({
  user: async ({ browserName: _browserName }, use) => {
    const credentials = makeCredentials();
    await apiSignup(credentials);
    await activateAccount(credentials.email);
    const cookies = await apiLogin(credentials.email, credentials.password).catch((err) => {
      throw new Error(
        `login after signup+activation failed: ${err instanceof Error ? err.message : String(err)}`,
        { cause: err }
      );
    });

    await use({ credentials, cookies });

    // teardown: delete the account regardless of test outcome
    try {
      await deleteSelf(cookies);
    } catch (err) {
      console.warn('user teardown failed:', err);
    }
  },

  authedPage: async ({ context, page, user }, use) => {
    await applyCookiesToContext(context, user.cookies);
    await use(page);
  },
});

export { expect } from '@playwright/test';

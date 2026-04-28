import { test as base, type BrowserContext, type Page } from '@playwright/test';
import { FRONTEND_URL } from './env';
import {
  type AuthCookies,
  type Credentials,
  deleteSelf,
  login as apiLogin,
  signup as apiSignup,
} from './api-client';

function uniqueId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
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
  const apiHost = (process.env.TEST_BACKEND_URL ?? 'https://api.openshock.dev').replace(
    /^https?:\/\//,
    ''
  );
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
    const sameSite =
      attrMap['samesite']?.toLowerCase() === 'none'
        ? 'None'
        : attrMap['samesite']?.toLowerCase() === 'strict'
          ? 'Strict'
          : 'Lax';
    return [
      {
        name,
        value,
        domain: attrMap['domain'] ?? apiHost,
        path: attrMap['path'] ?? '/',
        httpOnly: 'httponly' in attrMap,
        secure: 'secure' in attrMap,
        sameSite: sameSite as 'Lax' | 'None' | 'Strict',
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
  user: async ({}, use) => {
    const credentials = makeCredentials();
    await apiSignup(credentials);
    let cookies: AuthCookies = [];
    try {
      cookies = await apiLogin(credentials.email, credentials.password);
    } catch (err) {
      // login may fail if the account requires email activation;
      // in that case the test should rely on a pre-activated user or a backend dev toggle.
      throw new Error(
        `login after signup failed (email-activation may be required on this backend): ${
          err instanceof Error ? err.message : String(err)
        }`
      );
    }

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

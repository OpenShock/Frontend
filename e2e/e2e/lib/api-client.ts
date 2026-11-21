// Minimal API client used only for test teardown (activation, login and account deletion).
// Account creation happens through the browser UI in full E2E tests.
import { BACKEND_URL } from './env';

export type AuthCookies = string[];

// The targets this suite runs against do not enforce the captcha, so any value passes.
const TURNSTILE_RESPONSE = 'e2e-bypass';

async function readBody(res: Response): Promise<string> {
  try {
    return await res.text();
  } catch {
    return '';
  }
}

function joinCookieHeader(cookies: AuthCookies): string {
  return cookies.map((c) => c.split(';', 1)[0]).join('; ');
}

/** Activate an account with the token from its activation mail. */
export async function activate(token: string): Promise<void> {
  const res = await fetch(`${BACKEND_URL}/1/account/activate?token=${encodeURIComponent(token)}`, {
    method: 'POST',
  });
  if (!res.ok) {
    throw new Error(`activate failed: ${res.status} ${res.statusText} — ${await readBody(res)}`);
  }
}

/** Log in and return the session cookies. */
export async function login(email: string, password: string): Promise<AuthCookies> {
  const res = await fetch(`${BACKEND_URL}/2/account/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      usernameOrEmail: email,
      password,
      turnstileResponse: TURNSTILE_RESPONSE,
    }),
  });
  if (!res.ok) {
    throw new Error(`login failed: ${res.status} ${res.statusText} — ${await readBody(res)}`);
  }
  return res.headers.getSetCookie?.() ?? [];
}

/** Delete the account that owns the given auth cookies. */
export async function deleteSelf(cookies: AuthCookies): Promise<void> {
  const res = await fetch(`${BACKEND_URL}/1/account`, {
    method: 'DELETE',
    headers: { Cookie: joinCookieHeader(cookies) },
  });
  if (!res.ok && res.status !== 404) {
    throw new Error(
      `account-delete failed: ${res.status} ${res.statusText} — ${await readBody(res)}`
    );
  }
}

/** Log out (invalidates the session server-side). */
export async function logout(cookies: AuthCookies): Promise<void> {
  await fetch(`${BACKEND_URL}/1/account/logout`, {
    method: 'POST',
    headers: { Cookie: joinCookieHeader(cookies) },
  });
}

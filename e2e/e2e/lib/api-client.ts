// Minimal API client used only for test teardown (account deletion).
// Account creation happens through the browser UI in full E2E tests.
import { BACKEND_URL } from './env';

export type AuthCookies = string[];

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

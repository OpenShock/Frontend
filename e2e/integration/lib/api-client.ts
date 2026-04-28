import { BACKEND_URL, TURNSTILE_BYPASS } from './env';

export type Credentials = {
  username: string;
  email: string;
  password: string;
};

export type AuthCookies = string[];

async function readBody(res: Response): Promise<string> {
  try {
    return await res.text();
  } catch {
    return '';
  }
}

async function expectOk(res: Response, label: string): Promise<void> {
  if (res.ok) return;
  throw new Error(`${label} failed: ${res.status} ${res.statusText} — ${await readBody(res)}`);
}

export async function signup(creds: Credentials): Promise<void> {
  const res = await fetch(`${BACKEND_URL}/2/account/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...creds, turnstileResponse: TURNSTILE_BYPASS }),
  });
  await expectOk(res, 'signup');
}

export async function login(email: string, password: string): Promise<AuthCookies> {
  const res = await fetch(`${BACKEND_URL}/2/account/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, turnstileResponse: TURNSTILE_BYPASS }),
  });
  await expectOk(res, 'login');
  const setCookies = res.headers.getSetCookie?.() ?? [];
  if (setCookies.length === 0) {
    throw new Error('login succeeded but returned no Set-Cookie header — auth not bootstrapped');
  }
  return setCookies;
}

function joinCookieHeader(cookies: AuthCookies): string {
  return cookies.map((c) => c.split(';', 1)[0]).join('; ');
}

export async function deleteSelf(cookies: AuthCookies): Promise<void> {
  const res = await fetch(`${BACKEND_URL}/1/account`, {
    method: 'DELETE',
    headers: { Cookie: joinCookieHeader(cookies) },
  });
  // 404 is acceptable if the user was never persisted past signup-pending state
  if (!res.ok && res.status !== 404) {
    throw new Error(
      `account-delete failed: ${res.status} ${res.statusText} — ${await readBody(res)}`
    );
  }
}

export async function logout(cookies: AuthCookies): Promise<void> {
  const res = await fetch(`${BACKEND_URL}/1/account/logout`, {
    method: 'POST',
    headers: { Cookie: joinCookieHeader(cookies) },
  });
  await expectOk(res, 'logout');
}

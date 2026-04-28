import { BACKEND_URL, MAILPIT_URL, TURNSTILE_BYPASS } from './env';

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

/** Fetches the activation token from Mailpit and calls the API to activate the account. */
export async function activateAccount(email: string): Promise<void> {
  // Poll Mailpit for the activation email (up to 10s)
  let token: string | null = null;
  for (let attempt = 0; attempt < 20; attempt++) {
    const search = await fetch(
      `${MAILPIT_URL}/api/v1/search?query=${encodeURIComponent(`to:${email}`)}&limit=1`
    );
    if (search.ok) {
      const data = (await search.json()) as { messages?: { ID: string }[] };
      const msgId = data.messages?.[0]?.ID;
      if (msgId) {
        const msg = await fetch(`${MAILPIT_URL}/api/v1/message/${msgId}`);
        if (msg.ok) {
          const msgData = (await msg.json()) as { Text?: string };
          const match = (msgData.Text ?? '').match(/[?&]token=([A-Za-z0-9]+)/);
          if (match) {
            token = match[1];
            break;
          }
        }
      }
    }
    await new Promise((r) => setTimeout(r, 500));
  }

  if (!token) throw new Error(`activateAccount: no activation email found for ${email} in Mailpit`);

  const res = await fetch(`${BACKEND_URL}/1/account/activate?token=${token}`, { method: 'POST' });
  await expectOk(res, 'activate');
}

export async function login(email: string, password: string): Promise<AuthCookies> {
  const res = await fetch(`${BACKEND_URL}/2/account/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ usernameOrEmail: email, password, turnstileResponse: TURNSTILE_BYPASS }),
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

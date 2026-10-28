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

// Signup does not send the activation mail, it only queues it: the API writes an email_outbox
// row and nudges the Cron host over Redis, and the Cron host is what delivers it over SMTP. So
// the mail lands a moment after signup returns rather than synchronously, and this wait has to
// outlast that hop (Redis nudge -> Hangfire pickup -> SMTP).
const ACTIVATION_MAIL_TIMEOUT_MS = Number(process.env.TEST_MAIL_TIMEOUT_MS ?? 30_000);

/** Fetches the activation token from Mailpit and calls the API to activate the account. */
export async function activateAccount(email: string): Promise<void> {
  const deadline = Date.now() + ACTIVATION_MAIL_TIMEOUT_MS;
  let token: string | null = null;
  let sawMail = false;

  while (Date.now() < deadline) {
    const search = await fetch(
      `${MAILPIT_URL}/api/v1/search?query=${encodeURIComponent(`to:${email}`)}&limit=1`
    );
    if (search.ok) {
      const data = (await search.json()) as { messages?: { ID: string }[] };
      const msgId = data.messages?.[0]?.ID;
      if (msgId) {
        sawMail = true;
        const msg = await fetch(`${MAILPIT_URL}/api/v1/message/${msgId}`);
        if (msg.ok) {
          const msgData = (await msg.json()) as { Text?: string; HTML?: string };
          // The mail itself is a single HTML part; Text is the plaintext Mailpit renders from it,
          // which is the cleaner thing to match. Fall back to the markup if that ever stops.
          const match = (msgData.Text || msgData.HTML || '').match(/[?&]token=([A-Za-z0-9]+)/);
          if (match) {
            token = match[1];
            break;
          }
        }
      }
    }
    await new Promise((r) => setTimeout(r, 500));
  }

  if (!token) {
    // "Nothing was delivered" (the Cron host is not draining the outbox) and "mail arrived but
    // carried no token" (a changed template or link) have nothing to do with each other, so say
    // which one happened rather than making the next person find out.
    throw new Error(
      sawMail
        ? `activateAccount: mail for ${email} arrived in Mailpit but contained no activation token`
        : `activateAccount: no activation email for ${email} in Mailpit within ${ACTIVATION_MAIL_TIMEOUT_MS}ms`
    );
  }

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

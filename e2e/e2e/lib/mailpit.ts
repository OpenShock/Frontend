// MailPit API client for reading test emails.
// MailPit docs: https://mailpit.axllent.org/docs/api-v1/

export interface MailpitSummary {
  ID: string;
  Subject: string;
  To: Array<{ Address: string; Name: string }>;
  Date: string;
}

export interface MailpitMessage extends MailpitSummary {
  HTML: string;
  Text: string;
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`MailPit request failed: ${res.status} ${res.statusText}`);
  return res.json() as Promise<T>;
}

/** List the most recent messages addressed to `to`. Returns newest-first. */
async function listMessagesTo(mailpitUrl: string, to: string): Promise<MailpitSummary[]> {
  const query = encodeURIComponent(`to:"${to}"`);
  const data = await fetchJson<{ messages: MailpitSummary[] | null }>(
    `${mailpitUrl}/api/v1/messages?query=${query}&limit=10`
  );
  return data.messages ?? [];
}

/** Fetch the full body of a message. */
async function getMessage(mailpitUrl: string, id: string): Promise<MailpitMessage> {
  return fetchJson<MailpitMessage>(`${mailpitUrl}/api/v1/message/${id}`);
}

/** Delete a message (cleanup). */
export async function deleteMessage(mailpitUrl: string, id: string): Promise<void> {
  await fetch(`${mailpitUrl}/api/v1/message/${id}`, { method: 'DELETE' });
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Poll MailPit until an email to `to` arrives, then return its full content. */
export async function waitForEmailTo(
  mailpitUrl: string,
  to: string,
  { timeoutMs = 30_000, pollMs = 2_000 } = {}
): Promise<MailpitMessage> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const summaries = await listMessagesTo(mailpitUrl, to);
    if (summaries.length > 0) {
      return getMessage(mailpitUrl, summaries[0].ID);
    }
    await sleep(pollMs);
  }
  throw new Error(
    `No email to "${to}" found in MailPit (${mailpitUrl}) within ${timeoutMs / 1000}s`
  );
}

/**
 * Extract the first URL from the email that matches `pattern` and rewrite its
 * origin to `targetOrigin` so navigation works against the test frontend.
 */
export function extractAndRewriteLink(
  msg: MailpitMessage,
  pattern: RegExp,
  targetOrigin: string
): string | null {
  const body = msg.HTML || msg.Text;
  const match = body.match(pattern);
  if (!match) return null;
  try {
    const original = new URL(match[0].replace(/&amp;/g, '&'));
    const target = new URL(targetOrigin);
    original.protocol = target.protocol;
    original.hostname = target.hostname;
    original.port = target.port;
    return original.toString();
  } catch {
    return null;
  }
}

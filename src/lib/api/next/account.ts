import { getBackendURL } from '#lib/utils/url.js';
import { ResponseError } from './ResponseError';

/** Set by the API on signup while the account awaits activation; removed on login or once activated. */
export const ACTIVATION_RESEND_COOKIE = 'openShockActivationResend';

/**
 * Whether this browser can ask for the activation email again. Presence only: the API still decides whether
 * the cookie is valid (it may have expired, or the account may have been activated elsewhere).
 */
export function hasActivationResendCookie(): boolean {
  if (typeof document === 'undefined') return false;
  return document.cookie
    .split(';')
    .some((c) => c.trimStart().startsWith(`${ACTIVATION_RESEND_COOKIE}=`));
}

export type ResendActivationResult = 'sent' | 'throttled' | 'unavailable';

/**
 * Asks the API to resend the activation email for the account this browser just signed up. The account is
 * identified by the cookie the API set on signup, so there is no body.
 *
 * - `sent`: a new activation email was enqueued.
 * - `throttled`: one was sent too recently (one per 10 minutes, five per day).
 * - `unavailable`: no pending activation for this browser (cookie missing/expired, or already activated).
 */
export async function ResendActivationEmail(): Promise<ResendActivationResult> {
  const url = getBackendURL('1/account/activate/resend');

  const res = await fetch(url, {
    method: 'POST',
    headers: { accept: 'application/json' },
    credentials: 'include',
    redirect: 'error',
  });

  if (res.ok) return 'sent';
  if (res.status === 429) return 'throttled';
  if (res.status === 400) return 'unavailable';

  throw new ResponseError(res, `Unexpected status ${res.status} for POST ${url}`);
}

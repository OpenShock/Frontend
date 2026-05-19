export class ResponseError extends Error {
  override name = 'ResponseError';
  constructor(
    public response: Response,
    msg?: string
  ) {
    super(msg);
  }
}

export class RateLimitError extends ResponseError {
  override name = 'RateLimitError' as const;
  constructor(
    response: Response,
    /** Suggested wait in milliseconds parsed from Retry-After / X-RateLimit-Reset headers. */
    public retryAfterMs: number | null,
    msg?: string
  ) {
    super(response, msg);
  }
}

export class FetchError extends Error {
  override name = 'FetchError' as const;
  constructor(
    public cause: Error,
    msg?: string
  ) {
    super(msg);
  }
}

/**
 * Parse `Retry-After` (RFC 7231) or `X-RateLimit-Reset` (epoch seconds) into a
 * millisecond delay relative to now. Returns `null` when neither header is present
 * or parseable.
 */
export function parseRetryAfter(response: Response): number | null {
  const retryAfter = response.headers.get('retry-after');
  if (retryAfter) {
    const asNumber = Number(retryAfter);
    if (Number.isFinite(asNumber)) return Math.max(0, asNumber * 1000);
    const asDate = Date.parse(retryAfter);
    if (Number.isFinite(asDate)) return Math.max(0, asDate - Date.now());
  }
  const reset = response.headers.get('x-ratelimit-reset');
  if (reset) {
    const epochSeconds = Number(reset);
    if (Number.isFinite(epochSeconds)) return Math.max(0, epochSeconds * 1000 - Date.now());
  }
  return null;
}

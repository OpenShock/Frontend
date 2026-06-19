export class ResponseError extends Error {
  override name = 'ResponseError';
  constructor(
    public response: Response,
    msg?: string,
    /**
     * The parsed response body. The HTTP client consumes the response body
     * before this error is constructed, so `response.json()` would throw
     * "Body has already been consumed". Read the already-parsed body from here.
     */
    public body?: unknown
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
    msg?: string,
    body?: unknown
  ) {
    super(response, msg, body);
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

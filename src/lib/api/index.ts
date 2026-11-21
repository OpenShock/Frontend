import { FetchError, RateLimitError, ResponseError, parseRetryAfter } from './internal/errors';
import { client } from './internal/generated/client.gen';

client.interceptors.error.use((error, response, request) => {
  if (response) {
    const url = request?.url ?? '';
    const method = request?.method ?? '';
    const msg = `${method} ${url} → ${response.status}`;
    if (response.status === 429) {
      return new RateLimitError(response, parseRetryAfter(response), msg, error);
    }
    return new ResponseError(response, msg, error);
  }
  if (error instanceof Error) return new FetchError(error, error.message);
  return new FetchError(new Error(String(error)), 'Unknown fetch error');
});

export { FetchError, RateLimitError, ResponseError } from './internal/errors';

// One function per operation: the backend document lists only the newest version of each endpoint.
export * from './internal/generated';

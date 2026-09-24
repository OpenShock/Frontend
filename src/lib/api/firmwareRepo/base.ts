import { getFirmwareRepoURL, type FirmwareRepoPath } from '$lib/utils/url';
import { ResponseError } from './ResponseError';

/**
 * Fetches JSON from the firmware repository server.
 *
 * Unlike the backend client this sends no credentials — the repository server is a public,
 * cross-origin, read-only service.
 *
 * Pass a `URL` instead of a path when the request needs query parameters; build it with
 * {@link getFirmwareRepoURL} and set them via `searchParams`.
 */
export async function GetJson<T>(
  path: FirmwareRepoPath | URL,
  expectedStatus = 200,
  transformer: (data: unknown) => T
): Promise<T> {
  const url = path instanceof URL ? path : getFirmwareRepoURL(path);

  const res = await fetch(url, {
    method: 'GET',
    headers: { accept: 'application/json' },
    redirect: 'error',
  });

  if (res.status !== expectedStatus) {
    throw new ResponseError(res, `Unexpected status ${res.status} for GET ${url.href}`);
  }

  const contentType = res.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) {
    throw new ResponseError(res, `Expected JSON but got ${contentType}`);
  }

  const data = await res.json();

  return transformer(data);
}

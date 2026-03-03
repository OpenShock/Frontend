import { getBackendURL, type BackendPath } from '$lib/utils/url';
import { ResponseError } from './ResponseError';

export async function GetJson<T>(
  path: BackendPath,
  expectedStatus = 200,
  transformer: (data: unknown) => T
): Promise<T> {
  const res = await fetch(getBackendURL(path), {
    method: 'GET',
    headers: { accept: 'application/json' },
    credentials: 'include',
    redirect: 'error',
  });

  if (res.status !== expectedStatus) {
    throw new ResponseError(res, `Unexpected status ${res.status}`);
  }

  const contentType = res.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) {
    throw new ResponseError(res, `Expected JSON but got ${contentType}`);
  }

  const data = await res.json();

  return transformer(data);
}

export async function PostJson<T>(
  path: BackendPath,
  body: unknown,
  expectedStatus = 200,
  transformer: (data: unknown) => T
): Promise<T> {
  const url = getBackendURL(path);

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      accept: 'application/json',
    },
    body: JSON.stringify(body),
    credentials: 'include',
    redirect: 'error',
  });

  if (res.status !== expectedStatus) {
    throw new ResponseError(res, `Unexpected status ${res.status} for POST ${url}`);
  }

  const contentType = res.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) {
    throw new ResponseError(res, `Expected JSON but got ${contentType}`);
  }

  const data = await res.json();

  return transformer(data);
}

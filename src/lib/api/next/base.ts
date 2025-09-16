import { PUBLIC_BACKEND_API_DOMAIN } from '$env/static/public';
import { ResponseError } from './ResponseError';

const BaseUrl = `https://${PUBLIC_BACKEND_API_DOMAIN}`;

type ApiVersion = 1 | 2;
export type Path = `/${ApiVersion}/${string}`;

export function GetBackendUrl(path: Path) {
  return BaseUrl + path;
}

export async function GetJson<T>(
  path: Path,
  expectedStatus = 200,
  transformer: (data: unknown) => T
): Promise<T> {
  const res = await fetch(BaseUrl + path, {
    headers: { accept: 'application/json' },
    method: 'GET',
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
  path: Path,
  body: unknown,
  expectedStatus = 200,
  transformer: (data: unknown) => T
): Promise<T> {
  const url = GetBackendUrl(path);

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      accept: 'application/json',
    },
    body: JSON.stringify(body),
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
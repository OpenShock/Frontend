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

export async function PostRedirect(
  path: Path,
  expectedStatus: 302 | 303 | 307 | 308 = 302
): Promise<void> {
  const url = BaseUrl + path;
  const res = await fetch(url, { method: 'POST', redirect: 'manual' });

  if (res.status !== expectedStatus) {
    throw new ResponseError(res, `Unexpected status ${res.status} for POST ${url}`);
  }

  const loc = res.headers.get('Location');
  if (!loc) throw new ResponseError(res, 'Missing Location header');

  const target = new URL(loc, url); // handles absolute or relative

  // Restrict which domains we can be redirected to
  const allowedHosts = new Set([PUBLIC_BACKEND_API_DOMAIN, 'accounts.google.com', 'github.com']);

  if (!allowedHosts.has(target.hostname)) {
    throw new ResponseError(res, `Blocked redirect to disallowed host ${target.href}`);
  }

  if (target.protocol !== 'https:') {
    throw new ResponseError(res, `Blocked non-HTTPS redirect to ${target.href}`);
  }

  window.location.assign(target.toString());
}

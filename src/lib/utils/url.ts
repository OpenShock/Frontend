import { goto, replaceState } from '$app/navigation';
import { asset, base, match } from '$app/paths';
import { page } from '$app/state';
import type { Asset, Pathname } from '$app/types';
import { PUBLIC_BACKEND_API_URL, PUBLIC_SITE_SHORT_URL, PUBLIC_SITE_URL } from '$env/static/public';
// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Default query parameter name used for login/signup redirect targets. */
export const REDIRECT_QUERY_PARAM = 'redirect';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type BackendApiVersion = 1 | 2;

/**
 * A path segment for the backend API, always prefixed with a version number.
 *
 * @example "1"
 * @example "2/account/login"
 */
export type BackendPath = `${BackendApiVersion}` | `${BackendApiVersion}/${string}`;

// ---------------------------------------------------------------------------
// Backend
// ---------------------------------------------------------------------------

/**
 * Builds a fully-qualified URL for the backend API.
 *
 * The base URL is read from `PUBLIC_BACKEND_API_URL`. An optional
 * version-prefixed path is appended when provided.
 *
 * @param path - Version-prefixed resource path (e.g. `"2/account/login"`)
 * @returns A `URL` pointing at the backend resource
 *
 * @throws {Error} If `PUBLIC_BACKEND_API_URL` is not HTTPS
 * @throws {Error} If `PUBLIC_BACKEND_API_URL` contains query params or a hash
 *
 * @example
 * ```ts
 * getBackendURL();                 // https://api.example.com/
 * getBackendURL("2/account/login") // https://api.example.com/2/account/login
 * ```
 */
export function getBackendURL(path?: BackendPath): URL {
  const url = new URL(PUBLIC_BACKEND_API_URL);

  if (url.protocol !== 'https:') {
    throw new Error('PUBLIC_BACKEND_API_URL must be an HTTPS URL');
  }

  if (url.search || url.hash) {
    throw new Error('PUBLIC_BACKEND_API_URL must not contain query parameters or hash fragments');
  }

  if (path !== undefined) {
    // Ensure exactly one slash between the base pathname and the appended path
    const base = url.pathname.endsWith('/') ? url.pathname : `${url.pathname}/`;
    const suffix = path.startsWith('/') ? path.slice(1) : path;
    url.pathname = base + suffix;
  }

  return url;
}

// ---------------------------------------------------------------------------
// Site URLs
// ---------------------------------------------------------------------------

/**
 * Prefixes a pathname with the configured SvelteKit {@link base} path.
 *
 * Unlike `$app/paths.resolve`, this does **not** resolve route IDs or
 * populate dynamic parameters — it simply concatenates {@link base}
 * with a concrete pathname.
 *
 * @param path - A concrete internal pathname (e.g. `/settings/account`)
 * @returns The pathname prefixed with the current base path
 */
export function prefixBase(path: Pathname): string {
  return base + path;
}

/**
 * Builds a fully-qualified site URL from an internal pathname.
 *
 * @param path         - Internal pathname (e.g. `/settings/account`)
 * @param searchParams - Optional query parameters to append
 * @returns A `URL` rooted at `PUBLIC_SITE_URL`
 */
export function getSiteURL(path: Pathname, searchParams?: URLSearchParams): URL {
  const url = new URL(prefixBase(path), PUBLIC_SITE_URL);

  if (searchParams !== undefined) {
    searchParams.forEach((value, key) => url.searchParams.set(key, value));
  }

  return url;
}

/**
 * Builds a fully-qualified URL for a static asset.
 *
 * @param path - Asset path as typed by `$app/types.Asset`
 * @returns A `URL` rooted at `PUBLIC_SITE_URL`
 */
export function getSiteAssetURL(path: Asset): URL {
  return new URL(asset(path), PUBLIC_SITE_URL);
}

/**
 * Builds a short URL for sharing, using the configured
 * `PUBLIC_SITE_SHORT_URL` domain.
 *
 * @param path - Internal pathname to append
 * @returns A `URL` using the short domain
 */
export function getSiteShortURL(path: Pathname): URL {
  const url = new URL(PUBLIC_SITE_SHORT_URL);
  url.pathname = url.pathname.replace(/\/+$/, '') + path;
  return url;
}

/**
 * Returns `true` when the request URL's origin matches the configured
 * short-link domain (`PUBLIC_SITE_SHORT_URL`).
 */
export function isShortLinkOrigin(url: URL): boolean {
  return url.origin === new URL(PUBLIC_SITE_SHORT_URL).origin;
}

// ---------------------------------------------------------------------------
// Navigation helpers
// ---------------------------------------------------------------------------

/**
 * Returns `true` when the given URL is a same-origin HTTP(S) URL
 * relative to `PUBLIC_SITE_URL`.
 *
 * This is a pure, synchronous check — it does **not** verify that the
 * pathname matches a known route (that requires an async `match()` call).
 *
 * @param value - The raw redirect url to validate
 * @returns Whether the value is a safe, same-origin redirect target
 */
export function isValidRedirectURL(url: URL): boolean {
  const expected = new URL(PUBLIC_SITE_URL);

  const isHttp = url.protocol === 'http:' || url.protocol === 'https:';
  const sameOrigin = url.origin === expected.origin;

  return isHttp && sameOrigin;
}

/**
 * Returns `true` when the given string is a same-origin HTTP(S) URL
 * relative to `PUBLIC_SITE_URL`.
 *
 * This is a pure, synchronous check — it does **not** verify that the
 * pathname matches a known route (that requires an async `match()` call).
 *
 * @param value - The raw redirect value to validate
 * @returns Whether the value is a safe, same-origin redirect target
 */
export function isValidRedirectParam(value: string): boolean {
  try {
    // Try as absolute URL first — gets real origin checking
    return isValidRedirectURL(new URL(value));
  } catch {
    // Relative path — resolve against our origin to catch protocol-relative
    // URLs like //evil.com, then verify the result is still same-origin
    try {
      return isValidRedirectURL(new URL(value, PUBLIC_SITE_URL));
    } catch {
      return false;
    }
  }
}

/**
 * Strips an invalid redirect query parameter from the current URL bar.
 *
 * Reads the given query parameter from SvelteKit's {@link page} state.
 * If it is present and fails {@link isValidRedirectParam}, the parameter
 * is removed via SvelteKit's {@link replaceState} so the user never sees
 * a suspicious value in their address bar.
 *
 * Must be called after the SvelteKit router is initialised (e.g. in
 * `onMount`).
 *
 * @param queryParam - Name of the query parameter to check (default {@link REDIRECT_QUERY_PARAM})
 * @returns `true` when a malicious parameter was stripped, `false` otherwise
 */
export function sanitizeRedirectSearchParam(queryParam: string = REDIRECT_QUERY_PARAM): boolean {
  const value = page.url.searchParams.get(queryParam);
  if (value === null) return false;

  if (!isValidRedirectParam(value)) {
    const sanitized = new URL(page.url);
    sanitized.searchParams.delete(queryParam);
    /* eslint-disable-next-line svelte/no-navigation-without-resolve -- sanitized is already a full URL */
    replaceState(sanitized, {});
    return true;
  }

  return false;
}

/**
 * Strips the configured SvelteKit {@link base} path prefix from a pathname.
 *
 * Returns the pathname unchanged when it does not start with the base path.
 *
 * @param path - A pathname that may include the base prefix
 * @returns The pathname without the base prefix
 */
function stripBase(path: string): string {
  if (base && path.startsWith(base)) {
    return path.slice(base.length) || '/';
  }
  return path;
}

/**
 * Navigates to a redirect target read from a URL query parameter,
 * falling back to a safe internal pathname when the parameter is
 * missing or doesn't match a known route.
 *
 * The pathname, query string, and hash fragment from the redirect
 * parameter are preserved when the target is valid. Only same-origin,
 * HTTP(S) URLs whose pathname matches a known route are accepted;
 * everything else falls back to {@link fallback}.
 *
 * @param fallback   - Safe fallback pathname if redirect is missing/invalid
 * @param queryParam - Name of the query parameter holding the redirect target
 *
 * @example
 * ```ts
 * // URL: /login?redirect=/settings/account%3Ftab%3Dsecurity
 * await gotoQueryRedirectOrFallback('/home', 'redirect');
 * // → navigates to /settings/account?tab=security (if it matches a route)
 * // → otherwise navigates to /home
 * ```
 */
export async function gotoQueryRedirectOrFallback(
  fallback: Pathname,
  queryParam: string = REDIRECT_QUERY_PARAM
) {
  let target: Pathname = fallback;

  const redirectParam = page.url.searchParams.get(queryParam);

  if (redirectParam !== null && isValidRedirectParam(redirectParam)) {
    const parsed = new URL(redirectParam, PUBLIC_SITE_URL);
    let pathname = parsed.pathname;

    // Try stripping the base path prefix first (the redirect value
    // likely includes the base, e.g. from page.url.pathname).
    const stripped = stripBase(pathname);
    let matched = stripped !== pathname ? await match(stripped) : null;

    if (matched !== null) {
      pathname = stripped;
    } else {
      // Fall back to matching the raw pathname (already base-less).
      matched = await match(pathname);
    }

    if (matched !== null) {
      target = (pathname + parsed.search + parsed.hash) as Pathname;
    }
  }

  /* eslint-disable-next-line svelte/no-navigation-without-resolve -- target is already a resolved pathname, prefixBase just adds the base path */
  await goto(prefixBase(target));
}

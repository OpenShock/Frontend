import { goto } from '$app/navigation';
import { asset, base, match } from '$app/paths';
import { page } from '$app/state';
import type { Asset, Pathname } from '$app/types';
import { browser } from '$app/environment';
import { PUBLIC_BACKEND_API_URL, PUBLIC_SITE_SHORT_URL, PUBLIC_SITE_URL } from '$env/static/public';
import { redirectSanitized } from '$lib/state/RedirectSanitized.svelte';

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

// ---------------------------------------------------------------------------
// Navigation helpers
// ---------------------------------------------------------------------------

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
    const expected = new URL(PUBLIC_SITE_URL);
    const parsed = new URL(value, expected);

    const isHttp = parsed.protocol === 'http:' || parsed.protocol === 'https:';
    const sameOrigin = parsed.origin === expected.origin;

    return isHttp && sameOrigin;
  } catch {
    return false;
  }
}

/**
 * Strips an invalid redirect query parameter from the current URL bar.
 *
 * Reads the given query parameter from `window.location`. If it is
 * present and fails {@link isValidRedirectParam}, the parameter is
 * removed via the native History API so the user never sees a suspicious
 * value in their address bar. No-ops on the server.
 *
 * Uses native browser APIs instead of SvelteKit's `replaceState` so it
 * can safely run in `hooks.client.ts` `init()` — before SvelteKit's
 * router is initialised.
 *
 * @param queryParam - Name of the query parameter to check (default {@link REDIRECT_QUERY_PARAM})
 */
export function sanitizeRedirectSearchParam(queryParam: string = REDIRECT_QUERY_PARAM): void {
  if (!browser) return;

  const url = new URL(window.location.href);
  const value = url.searchParams.get(queryParam);
  if (value === null) return;

  if (!isValidRedirectParam(value)) {
    url.searchParams.delete(queryParam);
    history.replaceState(history.state, '', url);
    redirectSanitized.set();
  }
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
 * await gotoQueryRedirectOrFallback('/dashboard', 'redirect');
 * // → navigates to /settings/account?tab=security (if it matches a route)
 * // → otherwise navigates to /dashboard
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
    const pathname = parsed.pathname;

    const matched = await match(pathname);
    if (matched !== null) {
      target = (pathname + parsed.search + parsed.hash) as Pathname;
    }
  }

  /* eslint-disable-next-line svelte/no-navigation-without-resolve */
  await goto(prefixBase(target));
}

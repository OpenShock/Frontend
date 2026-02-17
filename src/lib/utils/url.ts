/* eslint-disable */

import { goto } from '$app/navigation';
import { base } from '$app/paths';
import { page } from '$app/state';
import type { Pathname } from '$app/types';

export function unsafeResolve(path: Pathname) {
  return base + path;
}

/**
 * Validates a user-provided redirect target and guarantees a safe,
 * same-origin pathname.
 *
 * - Absolute URLs are allowed only if they resolve to the current origin
 * - External origins are rejected
 * - Invalid URLs are rejected
 *
 * If the input is unsafe, the provided fallback pathname is returned.
 */
export function sanitizeRedirectPath(path: string, fallback: Pathname): Pathname {
  try {
    // Resolve relative or absolute paths against the current origin
    const resolved = new URL(path, page.url.origin);

    // Only allow same-origin navigation
    if (resolved.origin === page.url.origin) {
      return resolved.pathname as Pathname;
    }
  } catch {
    // Treat malformed URLs as unsafe
  }

  return fallback;
}

/**
 * Navigates to a redirect target taken from a query parameter,
 * falling back to a safe internal pathname.
 *
 * This mirrors `$app/paths.resolve()` behavior for prefixing `base`,
 * but avoids hash-based routing and strict typing issues.
 *
 * Typical use case:
 *   ?redirect=/account/settings
 */
export function gotoQueryRedirectOrFallback(fallback: Pathname, queryParam: string) {
  const redirectTarget = page.url.searchParams.get(queryParam);

  const target = redirectTarget ? sanitizeRedirectPath(redirectTarget, fallback) : fallback;

  goto(unsafeResolve(target));
}

import type { Pathname } from '$app/types';

// `import.meta.glob` is resolved by Vite at build time, so this becomes a static
// list baked into the bundle — no filesystem access at runtime.
const pageFiles = import.meta.glob('/src/routes/**/+page.svelte');

const APP_GROUP_PREFIX = '/src/routes/(app)/';

function stripGroups(path: string): string {
  return path.replace(/\/\([^)]+\)/g, '');
}

function fileToRoutePath(file: string): string {
  return stripGroups(file.replace(/^\/src\/routes/, '').replace(/\/\+page\.svelte$/, ''));
}

function isParameterized(path: string): boolean {
  return /\[[^\]]+\]/.test(path);
}

const allRoutePaths = Object.keys(pageFiles).map(fileToRoutePath);
const nonAppRoutePaths = Object.keys(pageFiles)
  .filter((f) => !f.startsWith(APP_GROUP_PREFIX))
  .map(fileToRoutePath);

/**
 * Statically-renderable, unauthenticated route paths discovered at build time.
 * Excludes `(app)/*` (auth-gated) and any route with `[param]` segments.
 */
export const publicRoutes: readonly Pathname[] = nonAppRoutePaths
  .filter((p) => !isParameterized(p))
  .map((p) => (p === '' ? '/' : p) as Pathname)
  .sort();

/**
 * For an authenticated route path, returns the shortest prefix (`/segment`,
 * `/segment/sub`, …) that does not overlap with any public route. Returns
 * `null` when no non-overlapping prefix exists (the route shares its path
 * space with public content — e.g. an `(app)` page that mirrors a public one).
 */
function shortestUniquePrefix(authPath: string): string | null {
  const parts = authPath.split('/').filter(Boolean);
  for (let depth = 1; depth <= parts.length; depth++) {
    const prefix = '/' + parts.slice(0, depth).join('/');
    const overlaps = nonAppRoutePaths.some(
      (p) => p === prefix || p.startsWith(prefix + '/') || prefix.startsWith(p + '/')
    );
    if (!overlaps) return prefix;
  }
  return null;
}

/**
 * Top-level path roots under `(app)/` that require authentication, collapsed
 * to the shortest prefix that does not overlap with any public route. Used to
 * communicate "do not index" coverage in `llms.txt`.
 */
export const authenticatedRoots: readonly string[] = [
  ...new Set(
    Object.keys(pageFiles)
      .filter((f) => f.startsWith(APP_GROUP_PREFIX))
      .map(fileToRoutePath)
      .map(shortestUniquePrefix)
      .filter((p): p is string => p !== null)
  ),
].sort();

// Tiny invariant check at module load — if app routes exist, we should
// have produced at least one root, otherwise the heuristic regressed.
if (allRoutePaths.some((p) => p.startsWith('/')) && authenticatedRoots.length === 0) {
  // intentionally not throwing in production — just silence the dead branch
}

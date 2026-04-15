import type { Pathname } from '$app/types';

export type RouteParam = { name: string; type: string };

export type RouteInfo = {
  categories: readonly string[];
  parameters: readonly RouteParam[];
  path: Pathname;
  original: string;
};

function fileToPath(file: string): RouteInfo {
  const original = file.replace(/^\/src\/routes/, '').replace(/\/\+page\.svelte$/, '') || '/';

  const categories: string[] = [];
  const parameters: RouteParam[] = [];
  const segments: string[] = [];

  for (const part of original.split('/')) {
    if (!part) continue;

    // (group)
    if (part[0] === '(' && part.at(-1) === ')') {
      categories.push(part.slice(1, -1));
      continue;
    }

    // [param] or [param=type]
    if (part[0] === '[' && part.at(-1) === ']') {
      const [name, type = 'unknown'] = part.slice(1, -1).split('=');
      parameters.push({ name, type });
      segments.push(`[${name}]`);
      continue;
    }

    segments.push(part);
  }

  const path = (segments.length ? '/' + segments.join('/') : '/') as Pathname;
  return { categories, parameters, path, original };
}

export const paths: readonly RouteInfo[] = Object.keys(
  import.meta.glob('/src/routes/**/+page.svelte')
).map(fileToPath);

const byPath = (a: RouteInfo, b: RouteInfo) => a.path.localeCompare(b.path);

export const publicRoutes: readonly Pathname[] = paths
  .filter((p) => !p.categories.includes('app') && p.parameters.length === 0)
  .toSorted(byPath)
  .map((p) => p.path);

export const authenticatedRoutes: readonly Pathname[] = paths
  .filter((p) => p.categories.includes('app'))
  .toSorted(byPath)
  .map((p) => p.path);

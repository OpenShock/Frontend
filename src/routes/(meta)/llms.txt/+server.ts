import { env } from '$env/dynamic/public';
import {
  PUBLIC_DISCORD_INVITE_URL,
  PUBLIC_GITHUB_PROJECT_URL,
  PUBLIC_SITE_DESCRIPTION,
  PUBLIC_SITE_NAME,
} from '$env/static/public';
import { isTruthy } from '$lib/utils/parse';
import { paths } from '$lib/utils/public-routes';
import { getBackendURL, getSiteURL } from '$lib/utils/url';
import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// Internal-only top-level segments we don't want to disclose to crawlers.
const HIDDEN_SEGMENTS: ReadonlySet<string> = new Set(['admin', 'hangfire']);

const SWAGGER_VERSIONS = [1, 2] as const;

export const GET: RequestHandler = ({ setHeaders }) => {
  if (isTruthy(env.PUBLIC_DISABLE_LLMS_TXT)) error(404);

  setHeaders({
    'content-type': 'text/plain; charset=utf-8',
    'cache-control': 'public, max-age=3600',
  });

  const name = PUBLIC_SITE_NAME.trim();
  const description = PUBLIC_SITE_DESCRIPTION.trim();
  const isOpenShock = name.toLowerCase() === 'openshock';

  const summary = isOpenShock
    ? `OpenShock — ${description}`
    : `${name} — an independent instance of OpenShock — ${description}`;

  // Public, linkable routes grouped by role.
  const publicPaths = paths
    .filter((p) => !p.categories.includes('app') && p.parameters.length === 0)
    .toSorted((a, b) => a.path.localeCompare(b.path));

  const generalPages = publicPaths.filter((p) => p.categories.length === 0);
  const authPages = publicPaths.filter((p) => p.categories.includes('auth'));

  const renderLinks = (list: typeof publicPaths) =>
    list.map((p) => `- [${p.path}](${getSiteURL(p.path).href})`).join('\n');

  const generalList = renderLinks(generalPages);
  const authList = renderLinks(authPages);

  // OpenAPI specs, one per backend API version.
  const apiURL = getBackendURL();
  const swaggerList = SWAGGER_VERSIONS.map(
    (v) => `- [v${v} OpenAPI spec](${new URL(`/swagger/${v}/swagger.json`, apiURL).href})`
  ).join('\n');

  // Authenticated app routes — listed for crawlers with a "not indexable" notice.
  const appPaths = paths
    .filter((p) => p.categories.includes('app'))
    .filter((p) => !HIDDEN_SEGMENTS.has(p.path.split('/')[1] ?? ''));

  const appSegments = [
    ...new Set(
      appPaths.map((p) => p.path.split('/')[1]).filter((seg): seg is string => Boolean(seg))
    ),
  ]
    .sort()
    .map((seg) => `\`/${seg}\``)
    .join(', ');

  const appList = appPaths
    .map((p) => p.path)
    .toSorted()
    .map((path) => `- ${path}`)
    .join('\n');

  const body = `# ${name}

> ${summary}

${name} is the web frontend of the OpenShock platform. Authenticated users manage \
hubs (ESP32-based bridges), shockers, share permissions, API tokens, and live control \
sessions. Unauthenticated visitors can flash firmware to a device over WebSerial or sign \
up for an account.

## Public pages

${generalList}

## Authentication pages

${authList}

## External resources

- [openshock.org](https://openshock.org): project website
- [wiki.openshock.org](https://wiki.openshock.org): user and developer documentation
- [GitHub](${PUBLIC_GITHUB_PROJECT_URL}): source code and issues
- [Discord](${PUBLIC_DISCORD_INVITE_URL}): community chat and support

## Backend API

${swaggerList}

## Notes for crawlers

Routes under ${appSegments} require authentication and contain user-specific \
data — not indexable:

${appList}
`;

  return new Response(body);
};

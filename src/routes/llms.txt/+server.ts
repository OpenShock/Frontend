import { env } from '$env/dynamic/public';
import { PUBLIC_SITE_DESCRIPTION, PUBLIC_SITE_NAME } from '$env/static/public';
import { error } from '@sveltejs/kit';
import { publicRoutes } from '$lib/utils/public-routes';
import { getSiteURL } from '$lib/utils/url';
import type { RequestHandler } from './$types';

export const prerender = false;

const isTruthy = (v?: string) => v === '1' || v?.toLowerCase() === 'true';

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

  const pageList = publicRoutes
    .map((path) => `- [${path}](${getSiteURL(path).href})`)
    .join('\n');

  const body = `# ${name}

> ${summary}

${name} is the web frontend of the OpenShock platform. Authenticated users manage \
hubs (ESP32-based bridges), shockers, share permissions, API tokens, and live control \
sessions. Unauthenticated visitors can flash firmware to a device over WebSerial or sign \
up for an account.

## Public pages

${pageList}

## External resources

- [openshock.org](https://openshock.org): project website
- [wiki.openshock.org](https://wiki.openshock.org): user and developer documentation
- [GitHub: OpenShock org](https://github.com/OpenShock): source code and issues

## Notes for crawlers

Routes under \`/admin\`, \`/hubs\`, \`/shockers\`, \`/shares/user\`, \`/settings\`, and \
\`/profile\` require authentication and contain user-specific data — not indexable.
`;

  return new Response(body);
};

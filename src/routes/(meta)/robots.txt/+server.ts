import { getSiteURL } from '#lib/utils/url.js';
import { PUBLIC_DENY_ROBOTS, PUBLIC_DISABLE_SITEMAP } from '$app/env/public';
import { isTruthy } from '@openshock/svelte-core/utils';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = ({ setHeaders }) => {
  setHeaders({
    'content-type': 'text/plain; charset=utf-8',
    'cache-control': 'public, max-age=3600',
  });

  if (isTruthy(PUBLIC_DENY_ROBOTS)) {
    return new Response('User-agent: *\nDisallow: /\n');
  }

  const lines = ['User-agent: *', 'Allow: /'];
  if (!isTruthy(PUBLIC_DISABLE_SITEMAP)) {
    lines.push(`Sitemap: ${getSiteURL('sitemap.xml').href}`);
  }

  return new Response(lines.join('\n') + '\n');
};

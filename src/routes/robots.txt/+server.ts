import { env } from '$env/dynamic/public';
import { getSiteURL } from '$lib/utils/url';
import type { RequestHandler } from './$types';

export const prerender = false;

const isTruthy = (v?: string) => v === '1' || v?.toLowerCase() === 'true';

export const GET: RequestHandler = ({ setHeaders }) => {
  setHeaders({
    'content-type': 'text/plain; charset=utf-8',
    'cache-control': 'public, max-age=3600',
  });

  if (isTruthy(env.PUBLIC_DENY_ROBOTS)) {
    return new Response('User-agent: *\nDisallow: /\n');
  }

  const lines = ['User-agent: *', 'Allow: /'];
  if (!isTruthy(env.PUBLIC_DISABLE_SITEMAP)) {
    lines.push(`Sitemap: ${getSiteURL('/sitemap.xml').href}`);
  }

  return new Response(lines.join('\n') + '\n');
};

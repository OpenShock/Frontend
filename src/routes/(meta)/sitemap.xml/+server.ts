import { env } from '$env/dynamic/public';
import { isTruthy } from '$lib/utils/parse';
import { publicRoutes } from '$lib/utils/public-routes';
import { getSiteURL, prefixBase } from '$lib/utils/url';
import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = ({ setHeaders }) => {
  if (isTruthy(env.PUBLIC_DISABLE_SITEMAP)) error(404);

  setHeaders({
    'content-type': 'application/xml; charset=utf-8',
    'cache-control': 'public, max-age=3600',
  });

  const lastmod = new Date().toISOString().slice(0, 10);
  const urls = publicRoutes
    .map((path) => `  <url><loc>${prefixBase(path)}</loc><lastmod>${lastmod}</lastmod></url>`)
    .join('\n');

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`
  );
};

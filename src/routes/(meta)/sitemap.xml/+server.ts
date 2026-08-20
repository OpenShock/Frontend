import { publicRoutes } from '#lib/utils/public-routes.js';
import { getSiteURL } from '#lib/utils/url.js';
import { PUBLIC_DISABLE_SITEMAP } from '$app/env/public';
import { isTruthy } from '@openshock/svelte-core/utils';
import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = ({ setHeaders }) => {
  if (isTruthy(PUBLIC_DISABLE_SITEMAP)) error(404);

  setHeaders({
    'content-type': 'application/xml; charset=utf-8',
    'cache-control': 'public, max-age=3600',
  });

  const lastmod = Temporal.Now.plainDateISO('UTC').toString();
  const urls = publicRoutes
    .map((path) => `  <url><loc>${getSiteURL(path).href}</loc><lastmod>${lastmod}</lastmod></url>`)
    .join('\n');

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`
  );
};

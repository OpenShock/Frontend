import { locales, localizeUrl } from '#lib/paraglide/runtime.js';
import { publicRoutes } from '#lib/utils/public-routes.js';
import { getSiteURL } from '#lib/utils/url.js';
import { PUBLIC_DISABLE_SITEMAP } from '$app/env/public';
import type { Path } from '$app/types';
import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = ({ setHeaders }) => {
  if (PUBLIC_DISABLE_SITEMAP) error(404);

  setHeaders({
    'content-type': 'application/xml; charset=utf-8',
    'cache-control': 'public, max-age=3600',
  });

  const lastmod = Temporal.Now.plainDateISO('UTC').toString();
  const homeURL = getSiteURL('' as Path);
  const localizedHomeURLs = locales
    .filter((locale) => locale !== 'uwu')
    .map((locale) => ({ locale, href: localizeUrl(homeURL, { locale }).href }));
  const homeAlternates = [
    ...localizedHomeURLs.map(
      ({ locale, href }) => `    <xhtml:link rel="alternate" hreflang="${locale}" href="${href}" />`
    ),
    `    <xhtml:link rel="alternate" hreflang="x-default" href="${homeURL.href}" />`,
  ].join('\n');
  // The bare home URL redirects to a localized one, so only the localized ones are listed.
  const urls = publicRoutes
    .filter((path) => path !== '')
    .map((path) => `  <url><loc>${getSiteURL(path).href}</loc><lastmod>${lastmod}</lastmod></url>`)
    .concat(
      localizedHomeURLs.map(
        ({ href }) =>
          `  <url><loc>${href}</loc>\n${homeAlternates}\n  <lastmod>${lastmod}</lastmod></url>`
      )
    )
    .join('\n');

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls}
</urlset>
`
  );
};

import { PUBLIC_FRONTEND_URL } from "$env/static/public";

export const prerender = true;

interface UrlEntry {
  loc: string;
  lastmod?: string;
  changefreq?: string;
  priority?: number;
}

function getUrl(props: UrlEntry) {
  let url = `<url><loc>${PUBLIC_FRONTEND_URL + props.loc}</loc>`;
  if (props.lastmod) url += `<lastmod>${props.lastmod}</lastmod>`;
  if (props.changefreq) url += `<changefreq>${props.changefreq}</changefreq>`;
  if (props.priority) url += `<priority>${props.priority}</priority>`;
  return url + '</url>';
}

function getXmlBody(urls: UrlEntry[]) {
  return `<?xml version="1.0" encoding="UTF-8" ?><urlset xmlns="https://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="https://www.w3.org/1999/xhtml" xmlns:mobile="https://www.google.com/schemas/sitemap-mobile/1.0" xmlns:news="https://www.google.com/schemas/sitemap-news/0.9" xmlns:image="https://www.google.com/schemas/sitemap-image/1.1" xmlns:video="https://www.google.com/schemas/sitemap-video/1.1">${urls
    .map(getUrl)
    .join()}</urlset>`;
}

export async function GET() {
  const urls: UrlEntry[] = [
    {
      loc: '/',
      lastmod: '2023-05-16',
      changefreq: 'daily',
      priority: 1,
    },
    {
      loc: '/login',
      lastmod: '2023-05-16',
      changefreq: 'daily',
      priority: 0.8,
    },
    {
      loc: '/register',
      lastmod: '2023-05-16',
      changefreq: 'daily',
      priority: 0.8,
    }
  ];

  return new Response(getXmlBody(urls), {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'max-age=0, s-maxage=3600',
      'X-Robots-Tag': 'all',
    },
  });
}

import { getSiteURL } from '$lib/utils/url';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = ({ url }) => {
  return new Response('Redirecting...', {
    status: 308,
    headers: {
      Location: getSiteURL('/shockers/own', url.searchParams).href,
    },
  });
};

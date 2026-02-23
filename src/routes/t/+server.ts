import { getSiteURL } from '$lib/utils/url';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = ({ url }) => {
  return new Response(String('Redirecting...'), {
    status: 308,
    headers: {
      Location: getSiteURL('/settings/api-tokens/new', url.searchParams).href,
    },
  });
};

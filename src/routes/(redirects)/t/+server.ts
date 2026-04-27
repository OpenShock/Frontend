import { resolve } from '$app/paths';
import { getSiteURL, isShortLinkOrigin } from '$lib/utils/url';
import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = ({ url }) => {
  const target = '/settings/api-tokens/new';

  if (isShortLinkOrigin(url)) {
    return redirect(303, getSiteURL(target, url.searchParams));
  }

  return redirect(303, resolve(target) + url.search);
};

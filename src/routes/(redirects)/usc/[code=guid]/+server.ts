import { getSiteURL, isShortLinkOrigin, prefixBase } from '#lib/utils/url.js';
import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = ({ url, params }) => {
  const target = 'shares/user/outgoing';
  const searchParams = new URLSearchParams({ redeem: params.code });

  if (isShortLinkOrigin(url)) {
    return redirect(303, getSiteURL(target, searchParams));
  }

  return redirect(303, prefixBase(`${target}?${searchParams}`));
};

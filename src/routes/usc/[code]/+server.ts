import { resolve } from '$app/paths';
import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getSiteURL, isShortLinkOrigin } from '$lib/utils/url';

export const GET: RequestHandler = ({ url, params }) => {
  const target = '/shares/user/outgoing';
  const searchParams = new URLSearchParams({ redeem: params.code });

  if (isShortLinkOrigin(url)) {
    return redirect(303, getSiteURL(target, searchParams));
  }

  return redirect(303, resolve(target) + '?' + searchParams.toString());
};

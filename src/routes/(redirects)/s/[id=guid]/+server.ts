import { resolve } from '$app/paths';
import type { Pathname } from '$app/types';
import { getSiteURL, isShortLinkOrigin } from '$lib/utils/url';
import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = ({ url, params }) => {
  const target: Pathname = `/shares/public/${params.id}`;

  if (isShortLinkOrigin(url)) {
    return redirect(303, getSiteURL(target));
  }

  return redirect(303, resolve(target));
};

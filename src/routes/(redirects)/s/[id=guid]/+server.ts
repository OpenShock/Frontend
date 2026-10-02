import { getSiteURL, isShortLinkOrigin, prefixBase } from '#lib/utils/url.js';
import type { Path } from '$app/types';
import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = ({ url, params }) => {
  const target: Path = `shares/public/${params.id}`;

  if (isShortLinkOrigin(url)) {
    return redirect(303, getSiteURL(target));
  }

  return redirect(303, prefixBase(target));
};

import { getSiteURL } from '$lib/utils/url';
import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = ({ url }) => {
  return redirect(308, getSiteURL('/shockers/own', url.searchParams));
};

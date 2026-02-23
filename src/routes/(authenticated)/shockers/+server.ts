import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { resolve } from '$app/paths';

export const GET: RequestHandler = ({ url }) => {
  return redirect(303, resolve('/shockers/own') + url.search);
};

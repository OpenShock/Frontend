import { getSiteURL } from '$lib/utils/url';
import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = ({ params }) => {
  return redirect(
    303,
    getSiteURL('/shares/user/outgoing', new URLSearchParams({ redeem: params.code }))
  );
};

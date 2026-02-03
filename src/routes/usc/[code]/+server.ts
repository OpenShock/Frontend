import { resolve } from '$app/paths';
import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = ({ params }) => {
  const location = `${resolve('/shares/user/outgoing')}?redeem=${encodeURIComponent(params.code)}`;
  console.log(`Redirecting to: ${location}`);
  throw redirect(303, location); // 303 = safe for GET and avoids caching as "permanent"
};

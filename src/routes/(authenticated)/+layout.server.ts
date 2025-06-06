import { HasOpenShockCookie } from '$lib/server/cookie';
import { redirect } from '@sveltejs/kit';

export function load({ cookies, url }) {
  if (!HasOpenShockCookie(cookies)) {
    redirect(303, `/login?redirectTo=${url.pathname}`);
  }
}

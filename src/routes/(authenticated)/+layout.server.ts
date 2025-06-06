import { HasOpenShockCookie } from '$lib/server/cookie';
import { redirect } from '@sveltejs/kit';

// On entering the authenticated section, check if the cookie is set, if it isnt, send us to the login page with a redirect to the page we are trying to reach
export function load({ cookies, url }) {
  if (!HasOpenShockCookie(cookies)) {
    redirect(302, `/login?redirect=${url.pathname}`);
  }
}

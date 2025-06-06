import { HasOpenShockCookie } from '$lib/server/cookie';
import { redirect } from '@sveltejs/kit';

// On loading in the anonymous section, check if cookie is set, if it is send us to the authenticated section
export function load({ cookies }) {
  if (HasOpenShockCookie(cookies)) {
    redirect(302, '/home');
  }
}

import { HasOpenShockCookie } from '$lib/server/cookie';
import { redirect } from '@sveltejs/kit';

export function load({ cookies }) {
  if (HasOpenShockCookie(cookies)) {
    redirect(303, '/home');
  }
}

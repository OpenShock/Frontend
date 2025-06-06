import { redirect } from '@sveltejs/kit';

export function load({ cookies }) {
  if (cookies.get('openShockSession')) {
    redirect(303, '/home');
  }
}

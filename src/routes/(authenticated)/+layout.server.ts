import { redirect } from '@sveltejs/kit';

export function load({ cookies, url }) {
  if (!cookies.get('openShockSession')) {
    redirect(303, `/login?redirect=${url.pathname}`);
  }
}

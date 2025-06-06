import { redirect } from '@sveltejs/kit';

export async function load({ cookies, url }) {
  const cookieValue = cookies.get('openShockSession');
  if (cookieValue !== undefined && cookieValue !== null) {
    redirect(303, url.searchParams.get('redirect') ?? '/home');
  }
}

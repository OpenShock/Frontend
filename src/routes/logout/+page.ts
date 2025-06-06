import { browser } from '$app/environment';
import { accountV1Api } from '$lib/api';
import { UserStore } from '$lib/stores/UserStore';
import { redirect } from '@sveltejs/kit';

export async function load() {
  if (!browser) return; // Do not run the following on server

  // Clear local store
  UserStore.reset();

  // Clear cookie and server state
  try {
    await accountV1Api.accountLogout();
  } catch {
    // Do nothing
  }

  // Go to landing page
  redirect(302, '/');
}

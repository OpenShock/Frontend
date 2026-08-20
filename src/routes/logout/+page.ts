import { accountLogout } from '#lib/api/index.js';
import { userState } from '#lib/state/user-state.svelte.js';
import { browser } from '$app/env';
import { goto } from '$app/navigation';
import { resolve } from '$app/paths';

export const prerender = false;

export async function load() {
  if (!browser) return; // Do not run the following on server

  // Clear cookie and server state
  try {
    await accountLogout();
  } catch (error) {
    console.error(error);
  }

  userState.reset();

  // Go to landing page
  goto(resolve('/'));
}

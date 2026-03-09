import { browser } from '$app/environment';
import { goto } from '$app/navigation';
import { resolve } from '$app/paths';
import { accountV1Api } from '$lib/api';
import { destroySignalR } from '$lib/signalr/user.svelte';
import { userState } from '$lib/state/user-state.svelte';

export const prerender = false;

export async function load() {
  if (!browser) return; // Do not run the following on server

  // Clear cookie and server state
  try {
    await accountV1Api.accountLogout();
  } catch (error) {
    console.error(error);
  }

  try {
    // Clear local context
    userState.reset();
    await destroySignalR();
  } catch (error) {
    console.error(error);
  }

  // Go to landing page
  goto(resolve('/'));
}

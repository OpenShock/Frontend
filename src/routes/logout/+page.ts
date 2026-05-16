import { browser } from '$app/environment';
import { goto } from '$app/navigation';
import { resolve } from '$app/paths';
import { accountV1Api } from '$lib/api';
import { bootstrapLogout } from '$lib/bootstrap.svelte';

export const prerender = false;

export async function load() {
  if (!browser) return; // Do not run the following on server

  // Clear cookie and server state
  try {
    await accountV1Api.accountLogout();
  } catch (error) {
    console.error(error);
  }

  bootstrapLogout();

  // Go to landing page
  goto(resolve('/'));
}

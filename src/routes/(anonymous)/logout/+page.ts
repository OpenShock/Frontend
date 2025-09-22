import { browser } from '$app/environment';
import { goto } from '$app/navigation';
import { accountV1Api } from '$lib/api';
import { destroySignalR } from '$lib/signalr';
import { UserStore } from '$lib/stores/UserStore';

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
    UserStore.reset();
    await destroySignalR();
  } catch (error) {
    console.error(error);
  }

  // Go to landing page
  goto('/');
}

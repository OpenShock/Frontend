import { browser } from '$app/environment';
import { goto } from '$app/navigation';
import { accountV1Api } from '$lib/api/index.js';
import { initializeSignalR } from '$lib/signalr';
import { IsAuthenticated } from '$lib/stores/AuthenticatedStore';
import { initializeDarkModeStore } from '$lib/stores/ColorSchemeStore.js';
import { initializeFlashManagersStore } from '$lib/stores/FlashManagersStore.js';
import { initializeSerialPortsStore } from '$lib/stores/SerialPortsStore.js';
import { initializeUserStore, UserStore } from '$lib/stores/UserStore.js';
import { get } from 'svelte/store';

// Set the default for the application
export const ssr = false; // Only this file and pages under it in browser
export const prerender = true;

export async function load({ data, url }) {
  if (!browser) return; // Be completely sure this only runs in browser

  console.log('+layout.ts (browser) - entry');

  if (url.pathname === '/logout') {
    console.log('+layout.ts (browser) - logout');

    // Clear local store
    UserStore.reset();

    // Clear cookie and server state
    try {
      await accountV1Api.accountLogout();
    } catch {
      // Do nothing
    }

    // Go to landing page
    goto('/');
    return;
  }

  const wasAuthenticated = get(IsAuthenticated);
  if (wasAuthenticated !== data.isAuthenticated) {
    console.log('+layout.ts (browser) - initialize');
    // Set authentication state
    IsAuthenticated.set(data.isAuthenticated);

    // First time init
    if (wasAuthenticated === undefined) {
      console.log('+layout.ts (browser) - initialize first time');
      initializeDarkModeStore();
      initializeFlashManagersStore();
      initializeSerialPortsStore();
    }

    // Init on getting authenticated
    if (data.isAuthenticated) {
      console.log('+layout.ts (browser) - initialize auth');
      initializeUserStore();
      initializeSignalR();
    }
  }
}

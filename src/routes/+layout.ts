import { browser } from '$app/environment';
import { initializeSignalR } from '$lib/signalr';
import { IsAuthenticated } from '$lib/stores/AuthenticatedStore';
import { initializeDarkModeStore } from '$lib/stores/ColorSchemeStore.js';
import { initializeFlashManagersStore } from '$lib/stores/FlashManagersStore.js';
import { initializeSerialPortsStore } from '$lib/stores/SerialPortsStore.js';
import { initializeUserStore } from '$lib/stores/UserStore.js';
import { get } from 'svelte/store';

// Set the default for the application
export const ssr = false; // Only this file and pages under it in browser
export const prerender = true;

export function load({ data }) {
  if (!browser) return; // Be completely sure this only runs in browser

  const wasAuthenticated = get(IsAuthenticated);
  if (wasAuthenticated !== data.isAuthenticated) {
    // Set authentication state
    IsAuthenticated.set(data.isAuthenticated);

    // First time init
    if (wasAuthenticated === undefined) {
      initializeDarkModeStore();
      initializeFlashManagersStore();
      initializeSerialPortsStore();
    }

    // Init on getting authenticated
    if (data.isAuthenticated) {
      initializeUserStore();
      initializeSignalR();
    }
  }
}

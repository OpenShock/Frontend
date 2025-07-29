import { browser } from '$app/environment';
import { initializeDarkModeStore } from '$lib/stores/ColorSchemeStore.svelte';
import { initializeSerialPortsStore } from '$lib/stores/SerialPortsStore';
import { UserStore } from '$lib/stores/UserStore';
import { get, writable } from 'svelte/store';
import { destroySignalR, initializeSignalR } from './signalr';

const isInitializedStore = writable<true | undefined>();

export async function initializeApp(initializeAuth: boolean) {
  if (!browser) return;

  // Multiple init protection
  if (get(isInitializedStore)) return;
  isInitializedStore.set(true);

  initializeDarkModeStore();
  initializeSerialPortsStore(); // TODO: Move this OUT of here

  if (!initializeAuth) return;

  const isAuthenticated = get(UserStore).self !== null;
  if (!isAuthenticated) {
    // Try to authenticate
    if (!(await UserStore.refreshSelf())) {
      // Failed to authenticate
      return;
    }
  }

  // Initialize SignalR connection
  await initializeSignalR();

  return true;
}

export async function destroyAuth() {
  UserStore.reset();
  await destroySignalR();
}

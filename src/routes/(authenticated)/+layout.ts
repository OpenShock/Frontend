import { browser } from '$app/environment';
import { initializeSignalR } from '$lib/signalr';
import { initializeStores } from '$lib/stores';

// The pages below this one will be different from user-to-user so cannot be prerendered and really shouldnt be server rendered
export const ssr = false;
export const prerender = false;

// Initialize stores and signalr on auth
export function load() {
  if (!browser) return; // Yeah please dont run the context init in server lmao

  initializeStores();
  initializeSignalR();
};

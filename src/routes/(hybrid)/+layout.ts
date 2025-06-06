
import { browser } from '$app/environment';
import { initializeSignalR } from '$lib/signalr';
import { initializeStores } from '$lib/stores';

// We cant really prerender anything beneath here effectivley either, it might change depending on if the user is authenticated or not
export const ssr = false;
export const prerender = false;

// Initialize stores and signalr on auth if we have our cookie
export function load({ data: { isAuthenticated } }) {
  if (!browser) return;

  if (isAuthenticated) {
    initializeStores();
    initializeSignalR();
  }
};

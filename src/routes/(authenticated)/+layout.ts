import { browser } from '$app/environment';
import { goto } from '$app/navigation';
import { IsAuthenticated } from '$lib/stores/AuthenticatedStore';
import { get } from 'svelte/store';

// The pages below this one will be different from user-to-user so cannot be prerendered and really shouldnt be server rendered
export const ssr = false; // Only render authenticated pages in browser
export const prerender = false;

// Initialize stores and signalr on auth
export function load({ url }) {
  if (!browser) return; // Yeah please dont run on server

  console.log('(anonymous)/+layout.ts (browser) - entry');

  // On loading in the anonymous section, check if cookie is set, if it is send us to the authenticated section
  if (!get(IsAuthenticated)) {
    console.log('(anonymous)/+layout.ts (browser) - redirect');
    goto(`/login?redirect=${url.pathname}`);
  }
};

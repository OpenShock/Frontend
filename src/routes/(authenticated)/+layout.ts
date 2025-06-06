import { browser } from '$app/environment';
import { goto } from '$app/navigation';
import { destroyAuth } from '$lib/init';
import { UserStore } from '$lib/stores/UserStore';
import { get } from 'svelte/store';

// The pages below this one will be different from user-to-user so cannot be prerendered and really shouldnt be server rendered
export const ssr = false; // Only render authenticated pages in browser
export const prerender = false;

// Initialize stores and signalr on auth
export async function load({ url }) {
  if (!browser) return; // Yeah please dont run on server

  // On loading in the anonymous section, check if cookie is set, if it is send us to the authenticated section
  if (!get(UserStore).self) {
    try {
      await destroyAuth();
    } catch (error) {
      console.error(error);
    } finally {
      goto(`/login?redirect=${url.pathname}`);
    }
  }
}

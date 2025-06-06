import { browser } from '$app/environment';
import { UserStore } from '$lib/stores/UserStore';

// Makes the load function only run in browser
export const ssr = false;

// Its fine to prerender all pages below this one as they wont change from browser to browser
export const prerender = true;

export function load() {
  if (!browser) return; // Just to be safe that the code below definetly runs in browser

  // If we make it to the anonymous section, make sure that userstore is clear, else behaviour will look weird
  UserStore.reset();
}

import { browser } from '$app/environment';
import { IsAuthenticated } from '$lib/stores/AuthenticatedStore';
import { UserStore } from '$lib/stores/UserStore';
import { redirect } from '@sveltejs/kit';
import { get } from 'svelte/store';

// Makes the load function only run in browser
export const ssr = false;

// Its fine to prerender all pages below this one as they wont change from browser to browser
export const prerender = true;

export function load() {
  if (!browser) return; // Just to be safe that the code below definetly runs in browser

  console.log('(anonymous)/+layout.ts (browser) - entry');

  // On loading in the anonymous section, check if cookie is set, if it is send us to the authenticated section
  if (get(IsAuthenticated)) {
    console.log('(anonymous)/+layout.ts (browser) - redirect');
    redirect(302, '/home');
  }

  // If we make it to the anonymous section, make sure that userstore is clear, else behaviour will look weird
  UserStore.reset();
}

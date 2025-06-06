import { browser } from '$app/environment';
import { initializeApp } from '$lib/init';

// Set the default for the application
export const ssr = false; // Only this file and pages under it in browser
export const prerender = true;

export async function load({ url }) {
  if (!browser) return; // Be completely sure this only runs in browser

  const isLoggingOut = url.pathname === '/logout';

  await initializeApp(!isLoggingOut);
}

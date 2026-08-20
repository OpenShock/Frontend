import { resolve } from '$app/paths';
import { authState } from '$lib/state/auth-state.svelte';
import { REDIRECT_QUERY_PARAM } from '$lib/utils/url';
import { redirect } from '@sveltejs/kit';

// The pages below this one will be different from user-to-user so cannot be prerendered and really shouldnt be server rendered
export const ssr = false; // Only render authenticated pages in browser
export const prerender = false;

// hooks.client.ts `init` has already populated authState before any load runs.
export function load({ url }) {
  if (!authState.isAuthenticated) {
    const redirectTo = encodeURIComponent(url.pathname + url.search);
    redirect(303, `${resolve('/login')}?${REDIRECT_QUERY_PARAM}=${redirectTo}`);
  }
}

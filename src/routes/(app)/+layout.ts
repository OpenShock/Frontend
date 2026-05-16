import { resolve } from '$app/paths';
import { bootstrapInit } from '$lib/bootstrap.svelte';
import { handleApiError } from '$lib/errorhandling/apiErrorHandling.js';
import { userState } from '$lib/state/user-state.svelte';
import { redirect } from '@sveltejs/kit';

// The pages below this one will be different from user-to-user so cannot be prerendered and really shouldnt be server rendered
export const ssr = false; // Only render authenticated pages in browser
export const prerender = false;

export async function load({ url }) {
  try {
    await bootstrapInit();

    if (!userState.self) {
      const next = encodeURIComponent(url.pathname + url.search);
      redirect(303, `${resolve('/login')}?next=${next}`);
    }
  } catch (error) {
    handleApiError(error);
  }
}

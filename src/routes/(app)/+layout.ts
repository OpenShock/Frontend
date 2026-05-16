import { resolve } from '$app/paths';
import { bootstrapInit } from '$lib/bootstrap.js';
import { handleApiError } from '$lib/errorhandling/apiErrorHandling.js';
import { redirect } from '@sveltejs/kit';

// The pages below this one will be different from user-to-user so cannot be prerendered and really shouldnt be server rendered
export const ssr = false; // Only render authenticated pages in browser
export const prerender = false;

export async function load({ url }) {
  try {
    const { isUserAuthenticated } = await bootstrapInit();

    if (!isUserAuthenticated) {
      const next = encodeURIComponent(url.pathname + url.search);
      redirect(303, `${resolve('/login')}?next=${next}`);
    }
  } catch (error) {
    handleApiError(error);
  }
}

import { resolve } from '$app/paths';
import { backendMetadata } from '$lib/state/backend-metadata-state.svelte';
import { redirect } from '@sveltejs/kit';

// The pages below this one will be different from user-to-user so cannot be prerendered and really shouldnt be server rendered
export const ssr = false; // Only render authenticated pages in browser
export const prerender = false;

export async function load({ url }) {
  const authed = await backendMetadata.init().catch(() => false);
  if (!authed) {
    const next = encodeURIComponent(url.pathname + url.search);
    redirect(303, `${resolve('/login')}?next=${next}`);
  }
}

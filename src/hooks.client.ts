import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
import { backendMetadata } from '$lib/state/backend-metadata-state.svelte';
import { initializeColorScheme } from '$lib/state/color-scheme-state.svelte';

export async function init() {
  // Kick off auth/backend bootstrap eagerly during hydration; the (app) layout
  // load awaits the same memoized promise to gate access.
  backendMetadata.init().catch((error) => {
    handleApiError(error);
  });
  initializeColorScheme();
}

export function handleError() {}

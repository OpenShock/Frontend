import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
import { bootstrapInit } from '$lib/bootstrap.svelte';
import { initializeColorScheme } from '$lib/state/color-scheme-state.svelte';

export async function init() {
  await bootstrapInit().catch(handleApiError);
  initializeColorScheme();
}

export function handleError() {}

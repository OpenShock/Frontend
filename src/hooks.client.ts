import { bootstrapInit } from '$lib/bootstrap.svelte';
import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
import { initializeColorScheme } from '$lib/state/color-scheme-state.svelte';

export async function init() {
  await bootstrapInit().catch(handleApiError);
  initializeColorScheme();
}

export function handleError() {}

import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
import { initializeSignalR } from '$lib/signalr/user.svelte';
import { backendMetadata } from '$lib/state/backend-metadata-state.svelte';
import { initializeColorScheme } from '$lib/state/color-scheme-state.svelte';
import { userState } from '$lib/state/user-state.svelte';

export async function init() {
  initBackendMetadata().catch((error) => {
    handleApiError(error);
  });
  initializeColorScheme();
}

async function initBackendMetadata() {
  const { isUserAuthenticated } = await backendMetadata.init();

  // Attempt to authenticate the user if backend says they are authenticated
  if (isUserAuthenticated) {
    // fire both requests in parallel
    await Promise.all([userState.refreshSelf(), initializeSignalR()]);
  }
}

export function handleError() {}

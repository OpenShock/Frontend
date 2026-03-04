import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
import { initializeSignalR } from '$lib/signalr/index.svelte';
import { backendMetadata } from '$lib/state/BackendMetadata.svelte';
import { initializeDarkModeStore } from '$lib/stores/ColorSchemeStore.svelte';
import { initializeSerialPortsStore } from '$lib/stores/SerialPortsStore';
import { UserStore } from '$lib/stores/UserStore';

export async function init() {
  initBackendMetadata().catch((error) => {
    handleApiError(error);
  });
  // init client-side stores
  initializeDarkModeStore();
  initializeSerialPortsStore(); // TODO: move this elsewhere if needed
}

async function initBackendMetadata() {
  const { isUserAuthenticated } = await backendMetadata.init();

  // Attempt to authenticate the user if backend says they are authenticated
  if (isUserAuthenticated) {
    // fire both requests in parallel
    await Promise.all([UserStore.refreshSelf(), initializeSignalR()]);
  }
}

export function handleError() {}

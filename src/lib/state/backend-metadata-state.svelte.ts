import { metaApi } from '$lib/api';
import type { BackendInfoResponse } from '$lib/api/internal/v1';
import { initializeSignalR } from '$lib/signalr/user.svelte';
import { userState } from './user-state.svelte';

let _state = $state<BackendInfoResponse | null>(null);
let _ready: Promise<boolean> | null = null;

async function bootstrap(): Promise<boolean> {
  const response = await metaApi.versionGetBackendInfo();
  if (!response.data) throw new Error(`Failed to get backend info: ${response.message}`);

  _state = response.data;

  if (!response.data.isUserAuthenticated) return false;

  // fire both requests in parallel
  const [refreshed] = await Promise.all([userState.refreshSelf(), initializeSignalR()]);
  return refreshed;
}

export const backendMetadata = {
  get state() {
    return _state;
  },
  // Memoized: returns a boolean promise resolving to whether the user is authenticated and ready.
  // Rejects only on hard failures (e.g. backend info call failed); callers that need to fail-closed
  // should `.catch(() => false)`.
  init(): Promise<boolean> {
    return (_ready ??= bootstrap());
  },
};

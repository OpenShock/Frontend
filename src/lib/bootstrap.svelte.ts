import type { BackendInfoResponse } from '$lib/api/internal/v1';
import { destroySignalR, initializeSignalR } from '$lib/signalr/user.svelte';
import { backendMetadata } from './state/backend-metadata-state.svelte';
import { userState } from './state/user-state.svelte';
import type { ApiUserSelf } from './types/ApiUser';

let _promise: Promise<BackendInfoResponse> | null;

async function exec(): Promise<BackendInfoResponse> {
  const response = await backendMetadata.fetch();

  if (response.isUserAuthenticated) {
    await Promise.all([userState.refreshSelf(), initializeSignalR()]);
  }

  return response;
}

export function bootstrapInit(): Promise<BackendInfoResponse> {
  return (_promise ??= exec());
}

export async function bootstrapLogin(user: ApiUserSelf) {
  const response = await backendMetadata.fetch();

  userState.setSelf(user);
  backendMetadata.setAuthenticated(true);

  // Re-Create SignalR connection
  await destroySignalR();
  await initializeSignalR();

  _promise = Promise.resolve(backendMetadata.state!);

  return response;
}

export async function bootstrapLogout() {

  backendMetadata.setAuthenticated(false);
  userState.reset();

  await destroySignalR();

  _promise = null;
}

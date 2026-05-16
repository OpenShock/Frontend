import { metaApi } from '$lib/api';
import { registerOnUnauthorized } from '$lib/errorhandling/apiErrorHandling';
import { destroySignalR, initializeSignalR } from '$lib/signalr/user.svelte';
import { backendMetadata } from './state/backend-metadata-state.svelte';
import { userState } from './state/user-state.svelte';

let _initPromise: Promise<void> | null = null;
let _stopSignalRLifecycle: (() => void) | null = null;

function startSignalRLifecycle() {
  if (_stopSignalRLifecycle) return;
  _stopSignalRLifecycle = $effect.root(() => {
    $effect(() => {
      if (userState.self) {
        void initializeSignalR();
      } else {
        void destroySignalR();
      }
    });
  });
}

async function exec(): Promise<void> {
  registerOnUnauthorized(() => userState.reset());

  const { data } = await metaApi.versionGetBackendInfo();
  backendMetadata.set(data);

  if (data.isUserAuthenticated) {
    await userState.refreshSelf();
  } else {
    userState.reset();
  }

  startSignalRLifecycle();
}

export function bootstrapInit(): Promise<void> {
  return (_initPromise ??= exec());
}

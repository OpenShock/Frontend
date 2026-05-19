import { base } from '$app/paths';
import { versionGetBackendInfo } from '$lib/api';
import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
import { authState, startAuthLifecycle } from '$lib/state/auth-state.svelte';
import { backendMetadata } from '$lib/state/backend-metadata-state.svelte';
import { initializeColorScheme } from '$lib/state/color-scheme-state.svelte';
import { userState } from '$lib/state/user-state.svelte';
import { redirectLegacyHashRoute } from '$lib/utils/legacy-hash-redirect';

async function ensureTemporal(): Promise<void> {
  if (typeof (globalThis as { Temporal?: unknown }).Temporal === 'undefined') {
    await import('temporal-polyfill/global');
  }
}

async function clientInit(): Promise<void> {
  const { data } = await versionGetBackendInfo();
  backendMetadata.set(data);

  if (data.isUserAuthenticated) {
    await userState.refreshSelf();
  } else {
    userState.reset();
  }

  authState.markBooted();
  startAuthLifecycle();
}

export async function init() {
  redirectLegacyHashRoute(base);
  await ensureTemporal();
  await clientInit().catch(handleApiError);
  initializeColorScheme();
}

export function handleError() {}

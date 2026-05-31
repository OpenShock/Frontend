import { base } from '$app/paths';
import { versionGetBackendInfo } from '$lib/api';
import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
import { authState, startAuthLifecycle } from '$lib/state/auth-state.svelte';
import { backendMetadata } from '$lib/state/backend-metadata-state.svelte';
import { initializeColorScheme } from '$lib/state/color-scheme-state.svelte';
import { userState } from '$lib/state/user-state.svelte';
import { initTelemetry, log } from '$lib/telemetry/logger';
import { redirectLegacyHashRoute } from '$lib/utils/legacy-hash-redirect';

/**
 * Forward uncaught browser errors and unhandled promise rejections to telemetry.
 * Chains onto any existing handlers rather than clobbering them.
 */
function registerGlobalErrorCapture(): void {
  const previousOnError = window.onerror;
  window.onerror = (message, source, lineno, colno, error) => {
    log.error(error?.message ?? String(message), {
      stack: error?.stack,
      source: source ?? undefined,
      lineno,
      colno,
    });
    return previousOnError?.call(window, message, source, lineno, colno, error) ?? false;
  };

  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason as { message?: string; stack?: string } | undefined;
    log.error(reason?.message ?? String(event.reason), { stack: reason?.stack });
  });
}

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
  initTelemetry();
  registerGlobalErrorCapture();
  redirectLegacyHashRoute(base);
  await ensureTemporal();
  await clientInit().catch(handleApiError);
  initializeColorScheme();
}

export function handleError() {}

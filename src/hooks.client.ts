import { base } from '$app/paths';
import { versionGetBackendInfo } from '$lib/api';
import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
import { authState, startAuthLifecycle } from '$lib/state/auth-state.svelte';
import { backendMetadata } from '$lib/state/backend-metadata-state.svelte';
import { initializeColorScheme } from '$lib/state/color-scheme-state.svelte';
import { userState } from '$lib/state/user-state.svelte';
import { initTelemetry, log } from '$lib/telemetry/logger';
import { redirectLegacyHashRoute } from '$lib/utils/legacy-hash-redirect';
import type { HandleClientError } from '@sveltejs/kit';

/** Best-effort extraction of a message + stack from an unknown thrown value. */
function describeError(value: unknown): { message: string; stack?: string } {
  if (value instanceof Error) return { message: value.message, stack: value.stack };
  if (typeof value === 'object' && value !== null) {
    const obj = value as { message?: unknown; stack?: unknown };
    return {
      message: typeof obj.message === 'string' ? obj.message : String(value),
      stack: typeof obj.stack === 'string' ? obj.stack : undefined,
    };
  }
  return { message: String(value) };
}

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

  // Also capture explicit `console.error(...)` calls, which neither window.onerror nor
  // unhandledrejection see. Chain onto the original so the console still works as usual.
  const previousConsoleError = console.error.bind(console);
  console.error = (...args: unknown[]) => {
    const err = args.find((a) => a instanceof Error) as Error | undefined;
    const message = err
      ? err.message
      : args.map((a) => (typeof a === 'string' ? a : String(a))).join(' ');
    log.error(message, { stack: err?.stack });
    previousConsoleError(...args);
  };
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

/**
 * SvelteKit routes errors thrown during rendering, load, and navigation here instead of to
 * window.onerror — so forward them to telemetry too, otherwise they're silently swallowed.
 */
export const handleError: HandleClientError = ({ error, event, status, message }) => {
  const { message: errMessage, stack } = describeError(error);
  log.error(errMessage, {
    stack,
    status,
    route: event.route?.id ?? undefined,
    kitMessage: message,
  });
};

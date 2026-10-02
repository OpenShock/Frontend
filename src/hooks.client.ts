import type { HandleClientError } from '@sveltejs/kit/hooks';
import 'temporal-polyfill/global';

import { versionGetBackendInfo } from '#lib/api/index.js';
import { handleApiError } from '#lib/errorhandling/apiErrorHandling.js';
import { authState, startAuthLifecycle } from '#lib/state/auth-state.svelte.js';
import { backendMetadata } from '#lib/state/backend-metadata-state.svelte.js';
import { userState } from '#lib/state/user-state.svelte.js';
import { initTelemetry, log } from '#lib/telemetry/logger.js';
import { redirectLegacyHashRoute } from '#lib/utils/legacy-hash-redirect.js';
import { basePath } from '#lib/utils/url.js';
import { initializeColorScheme } from '@openshock/svelte-core/state/color-scheme-state.svelte.js';

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
  // `basePath()` has no trailing slash — the mapped target already starts with one.
  redirectLegacyHashRoute(basePath());
  await clientInit().catch(handleApiError);
  initializeColorScheme();
}

/**
 * SvelteKit routes errors thrown during rendering, load, and navigation here instead of to
 * window.onerror — so forward them to telemetry too, otherwise they're silently swallowed.
 *
 * Since SvelteKit 3 this also receives *expected* errors: `error(...)` thrown by our own code
 * (`kind: 'app'`) and SvelteKit's own 404s and the like (`kind: 'framework'`). Those are normal
 * responses rather than defects, so they are logged at warn level and only unexpected throws
 * are reported as errors.
 */
export const handleError: HandleClientError = ({ kind, error, event }) => {
  const route = event.route?.id ?? undefined;

  if (kind === 'unknown') {
    const { message, stack } = describeError(error);
    log.error(message, { stack, status: 500, route, kind });
    return;
  }

  log.warn(error.message, {
    status: kind === 'framework' ? error.status : undefined,
    route,
    kind,
  });
};

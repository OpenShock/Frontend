import { version } from '$app/environment';
import {
  PUBLIC_BACKEND_API_URL,
  PUBLIC_SIGNOZ_DEPLOYMENT_ENVIRONMENT,
  PUBLIC_SIGNOZ_LOGS_ENABLED,
  PUBLIC_SIGNOZ_LOGS_URL,
  PUBLIC_SIGNOZ_RESOURCE_ATTRIBUTES,
  PUBLIC_SIGNOZ_TRACES_URL,
} from '$env/static/public';
import { telemetryConsent, type TelemetryLevel } from '$lib/state/telemetry-consent-state.svelte';
import { isTruthy } from '@openshock/svelte-core/utils/parse';
import { resourceFromAttributes } from '@opentelemetry/resources';

export const SERVICE_NAME = 'openshock-frontend';

const DEFAULT_COLLECTOR_ORIGIN = 'https://signoz.openshock.app';

function originOf(url: string, fallback: string): string {
  try {
    return new URL(url).origin;
  } catch {
    return fallback;
  }
}

const COLLECTOR_ORIGIN = originOf(PUBLIC_SIGNOZ_LOGS_URL, DEFAULT_COLLECTOR_ORIGIN);

/** OTLP/HTTP signal endpoints. Each falls back to the collector origin + the standard path. */
export const LOGS_URL = PUBLIC_SIGNOZ_LOGS_URL || `${COLLECTOR_ORIGIN}/v1/logs`;
export const TRACES_URL = PUBLIC_SIGNOZ_TRACES_URL || `${COLLECTOR_ORIGIN}/v1/traces`;

/** Origin of the OpenShock backend API — the only requests we trace (privacy: no navigations). */
export const API_ORIGIN = originOf(PUBLIC_BACKEND_API_URL, '');

/**
 * Parse OTel-style `key=value,key2=value2` resource attributes (the same format as the standard
 * `OTEL_RESOURCE_ATTRIBUTES` env var). Malformed pairs are skipped rather than throwing.
 */
function parseResourceAttributes(raw: string | undefined): Record<string, string> {
  const out: Record<string, string> = {};
  if (!raw) return out;
  for (const pair of raw.split(',')) {
    const eq = pair.indexOf('=');
    if (eq <= 0) continue;
    const key = pair.slice(0, eq).trim();
    const value = pair.slice(eq + 1).trim();
    if (key) out[key] = value;
  }
  return out;
}

/**
 * Build the OTel resource shared by every signal (logs + traces) so they correlate as one service
 * in SigNoz. `service.version` is the git SHA (per-build), which drives SigNoz deployment markers.
 */
export function buildResource() {
  return resourceFromAttributes({
    'service.name': SERVICE_NAME,
    'service.version': version,
    // Configurable deployment environment (e.g. production / staging / development). Falls back to
    // the build mode so everything is always tagged with something sensible.
    'deployment.environment':
      PUBLIC_SIGNOZ_DEPLOYMENT_ENVIRONMENT || (import.meta.env.DEV ? 'development' : 'production'),
    // Arbitrary extra attributes from the env, last so they can override the above if needed.
    ...parseResourceAttributes(PUBLIC_SIGNOZ_RESOURCE_ATTRIBUTES),
  });
}

/**
 * Shared gate for all telemetry signals. Returns the effective level to initialize:
 *  - `off`    — send nothing.
 *  - `errors` — ship error reports (logs) only.
 *  - `full`   — ship error reports plus API-call traces.
 *
 * Requires the deployment kill-switch (`PUBLIC_SIGNOZ_LOGS_ENABLED`) and returns the user's chosen
 * consent level.
 */
export function telemetryLevel(): TelemetryLevel {
  // SSR / prerender guard — must never touch window or open a network connection at build time.
  if (typeof window === 'undefined') return 'off';

  // Deployment kill-switch: only ship from a deployment with a configured collector.
  if (!isTruthy(PUBLIC_SIGNOZ_LOGS_ENABLED)) return 'off';

  // Opt-in: respect the user's chosen consent level.
  return telemetryConsent.value;
}

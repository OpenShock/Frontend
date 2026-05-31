import { version } from '$app/environment';
import { PUBLIC_SIGNOZ_LOGS_ENABLED, PUBLIC_SIGNOZ_LOGS_URL } from '$env/static/public';
import { telemetryConsent } from '$lib/state/telemetry-consent-state.svelte';
import { logs, SeverityNumber, type LogAttributes } from '@opentelemetry/api-logs';
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { BatchLogRecordProcessor, LoggerProvider } from '@opentelemetry/sdk-logs';

const SERVICE_NAME = 'openshock-frontend';
const DEFAULT_LOGS_URL = 'https://signoz.openshock.app/v1/logs';

let initialized = false;

/**
 * Initialize OpenTelemetry log shipping to SigNoz.
 *
 * Browser-only and opt-in. It does nothing unless ALL of the following hold:
 *  - running in the browser (not SSR/prerender/build),
 *  - not in dev (`import.meta.env.DEV`),
 *  - the deployment enables it (`PUBLIC_SIGNOZ_LOGS_ENABLED === 'true'`), and
 *  - the user has explicitly consented ({@link telemetryConsent}).
 *
 * It is idempotent and safe to call again after the user opts in. All OTel/browser
 * construction happens inside this function so the module is import-safe during the SSR build.
 */
export function initTelemetry(): void {
  // SSR / prerender guard — must never touch window or open a network connection at build time.
  if (typeof window === 'undefined') return;
  if (initialized) return;

  // Deployment kill-switch: only ship logs from a deployment with a configured collector.
  if (import.meta.env.DEV || PUBLIC_SIGNOZ_LOGS_ENABLED !== 'true') return;

  // Opt-in: never send anything without explicit user consent.
  if (!telemetryConsent.value) return;

  initialized = true;

  const endpoint = PUBLIC_SIGNOZ_LOGS_URL || DEFAULT_LOGS_URL;

  const resource = resourceFromAttributes({
    'service.name': SERVICE_NAME,
    'service.version': version,
  });

  const provider = new LoggerProvider({
    resource,
    processors: [new BatchLogRecordProcessor(new OTLPLogExporter({ url: endpoint }))],
  });

  logs.setGlobalLoggerProvider(provider);
}

/** Get the shared logger. Safely returns a no-op logger when telemetry was not initialized. */
export function getLogger() {
  return logs.getLogger(SERVICE_NAME);
}

function emit(
  severityText: string,
  severityNumber: SeverityNumber,
  message: string,
  attributes?: LogAttributes
): void {
  try {
    getLogger().emit({ severityText, severityNumber, body: message, attributes });
  } catch {
    // Never let logging break the page.
  }
}

/** Convenience helpers that no-op safely when telemetry is disabled/uninitialized. */
export const log = {
  info: (message: string, attributes?: LogAttributes) =>
    emit('INFO', SeverityNumber.INFO, message, attributes),
  warn: (message: string, attributes?: LogAttributes) =>
    emit('WARN', SeverityNumber.WARN, message, attributes),
  error: (message: string, attributes?: LogAttributes) =>
    emit('ERROR', SeverityNumber.ERROR, message, attributes),
};

import { logs, SeverityNumber, type LogAttributes } from '@opentelemetry/api-logs';
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http';
import { BatchLogRecordProcessor, LoggerProvider } from '@opentelemetry/sdk-logs';
import { buildResource, LOGS_URL, SERVICE_NAME, telemetryLevel } from './common';
import { initTracing } from './tracer';

let logsInitialized = false;

/**
 * Initialize OpenTelemetry error-log shipping to SigNoz.
 *
 * Browser-only and opt-in (see {@link telemetryLevel}). Runs at the `errors` and `full` levels.
 * Idempotent and safe to call again after the user opts in.
 */
function initLogs(): void {
  if (logsInitialized) return;
  if (telemetryLevel() === 'off') return;

  logsInitialized = true;

  const processors = [
    new BatchLogRecordProcessor({ exporter: new OTLPLogExporter({ url: LOGS_URL }) }),
  ];

  logs.setGlobalLoggerProvider(new LoggerProvider({ resource: buildResource(), processors }));
}

/**
 * Initialize all telemetry signals according to the user's consent level: error logs at
 * `errors`/`full`, API-call traces at `full`. Idempotent; call again after the level changes.
 */
export function initTelemetry(): void {
  initLogs();
  initTracing();
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

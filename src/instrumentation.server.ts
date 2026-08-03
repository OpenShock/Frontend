import { version } from '$app/environment';
import {
  PUBLIC_SIGNOZ_DEPLOYMENT_ENVIRONMENT,
  PUBLIC_SIGNOZ_LOGS_ENABLED,
  PUBLIC_SIGNOZ_LOGS_URL,
  PUBLIC_SIGNOZ_TRACES_URL,
} from '$env/static/public';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { BatchSpanProcessor, NodeTracerProvider } from '@opentelemetry/sdk-trace-node';

// Collector for SvelteKit's experimental server-side spans (handle/load/form actions,
// enabled via kit.experimental.tracing in vite.config.ts). Runs before any application
// code is imported, so it must stay self-contained: no $lib imports — the client
// telemetry module ($lib/telemetry/common) pulls in consent state and other
// browser-oriented code that has no business in the server bootstrap.

const DEFAULT_COLLECTOR_ORIGIN = 'https://signoz.openshock.app';

function originOf(url: string, fallback: string): string {
  try {
    return new URL(url).origin;
  } catch {
    return fallback;
  }
}

// Server spans describe our infrastructure, not user behavior, so they are gated only by
// the deployment kill-switch — the per-user consent flow in $lib/telemetry does not apply.
const enabled = PUBLIC_SIGNOZ_LOGS_ENABLED === 'true' || PUBLIC_SIGNOZ_LOGS_ENABLED === '1';

if (enabled) {
  try {
    const collectorOrigin = originOf(PUBLIC_SIGNOZ_LOGS_URL, DEFAULT_COLLECTOR_ORIGIN);
    const tracesUrl = PUBLIC_SIGNOZ_TRACES_URL || `${collectorOrigin}/v1/traces`;

    const provider = new NodeTracerProvider({
      // Mirrors $lib/telemetry/common buildResource() so client and server signals
      // correlate as one service in SigNoz; `service.version` (the git SHA) drives
      // SigNoz deployment markers.
      resource: resourceFromAttributes({
        'service.name': 'openshock-frontend',
        'service.version': version,
        'deployment.environment':
          PUBLIC_SIGNOZ_DEPLOYMENT_ENVIRONMENT ||
          (import.meta.env.DEV ? 'development' : 'production'),
      }),
      spanProcessors: [new BatchSpanProcessor(new OTLPTraceExporter({ url: tracesUrl }))],
    });

    provider.register();
  } catch (error) {
    // Tracing is best-effort — a broken collector setup must never take the server down.
    console.error('Failed to initialize server-side tracing:', error);
  }
}

import { PUBLIC_SIGNOZ_TRACE_PROPAGATION } from '$env/static/public';
import { isTruthy } from '@openshock/svelte-core/utils/parse';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { FetchInstrumentation } from '@opentelemetry/instrumentation-fetch';
import { BatchSpanProcessor, WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { API_ORIGIN, buildResource, telemetryLevel, TRACES_URL } from './common';

let tracingInitialized = false;

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Initialize OpenTelemetry tracing of backend API calls.
 *
 * Privacy by design: only `fetch` requests to {@link API_ORIGIN} are traced — never page
 * navigations, document loads, user interactions, or third-party requests. Runs only at the `full`
 * consent level (see {@link telemetryLevel}). Idempotent.
 */
export function initTracing(): void {
  if (tracingInitialized) return;
  if (telemetryLevel() !== 'full') return;
  if (!API_ORIGIN) return; // No API origin configured — nothing to trace.

  tracingInitialized = true;

  const spanProcessors = [new BatchSpanProcessor(new OTLPTraceExporter({ url: TRACES_URL }))];

  const provider = new WebTracerProvider({ resource: buildResource(), spanProcessors });
  // Default (StackContextManager) — no zone.js, no global patching beyond fetch instrumentation.
  provider.register();

  // Trace ONLY our API: ignore every URL that does not start with the API origin. This also
  // excludes the OTLP trace export itself (different origin), avoiding a feedback loop.
  const ignoreNonApi = new RegExp(`^(?!${escapeRegExp(API_ORIGIN)})`);

  // Distributed tracing: attach `traceparent`/`tracestate` to API requests so the backend can
  // continue the trace. Cross-origin, so the backend's CORS must allow those request headers —
  // off by default to avoid breaking API calls before the backend is ready.
  const propagateToBackend = isTruthy(PUBLIC_SIGNOZ_TRACE_PROPAGATION);

  registerInstrumentations({
    instrumentations: [
      new FetchInstrumentation({
        ignoreUrls: [ignoreNonApi],
        clearTimingResources: true,
        propagateTraceHeaderCorsUrls: propagateToBackend
          ? [new RegExp(`^${escapeRegExp(API_ORIGIN)}`)]
          : [],
      }),
    ],
  });
}

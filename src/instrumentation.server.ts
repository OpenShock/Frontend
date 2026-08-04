import { version } from '$app/environment';
import {
  PUBLIC_SIGNOZ_DEPLOYMENT_ENVIRONMENT,
  PUBLIC_SIGNOZ_LOGS_ENABLED,
  PUBLIC_SIGNOZ_LOGS_URL,
  PUBLIC_SIGNOZ_TRACES_URL,
} from '$env/static/public';
import {
  ROOT_CONTEXT,
  context as otelContext,
  trace as otelTrace,
  type Context,
  type ContextManager,
} from '@opentelemetry/api';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { BasicTracerProvider, BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { AsyncLocalStorage } from 'node:async_hooks';

// Collector for SvelteKit's experimental server-side spans (handle/load/form actions,
// enabled via kit.experimental.tracing in vite.config.ts). Runs before any application
// code is imported, so it must stay self-contained: no $lib imports — the client
// telemetry module ($lib/telemetry/common) pulls in consent state and other
// browser-oriented code that has no business in the server bootstrap.
//
// Uses BasicTracerProvider + a hand-rolled AsyncLocalStorage context manager instead of
// NodeTracerProvider: sdk-trace-node pulls in @opentelemetry/context-async-hooks, whose
// bare `require("events")`/`require("async_hooks")` Cloudflare's Pages Functions bundler
// cannot resolve. The `node:`-prefixed import below bundles fine and resolves at runtime
// on workerd (nodejs_compat/nodejs_als) and Node alike.

class AlsContextManager implements ContextManager {
  #als = new AsyncLocalStorage<Context>();

  active(): Context {
    return this.#als.getStore() ?? ROOT_CONTEXT;
  }

  with<A extends unknown[], F extends (...args: A) => ReturnType<F>>(
    context: Context,
    fn: F,
    thisArg?: ThisParameterType<F>,
    ...args: A
  ): ReturnType<F> {
    return this.#als.run(context, () => fn.apply(thisArg as ThisParameterType<F>, args));
  }

  bind<T>(context: Context, target: T): T {
    if (typeof target !== 'function') return target;
    // eslint-disable-next-line @typescript-eslint/no-this-alias -- the wrapper must forward the caller's dynamic `this`, so the manager is captured under another name
    const manager = this;
    return function (this: unknown, ...args: unknown[]) {
      return manager.with(context, () =>
        (target as (...a: unknown[]) => unknown).apply(this, args)
      );
    } as T;
  }

  enable(): this {
    return this;
  }

  disable(): this {
    this.#als.disable();
    return this;
  }
}

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

    const provider = new BasicTracerProvider({
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

    otelContext.setGlobalContextManager(new AlsContextManager().enable());
    otelTrace.setGlobalTracerProvider(provider);
  } catch (error) {
    // Tracing is best-effort — a broken collector setup must never take the server down.
    console.error('Failed to initialize server-side tracing:', error);
  }
}

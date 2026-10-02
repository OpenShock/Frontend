import { defineEnvVars } from '@sveltejs/kit/env';
// `isTruthy` is the schema for every boolean variable below: it accepts `true` / `1` / `yes` / `y` /
// `on` case-insensitively and treats everything else, including unset, as `false`. That preserves
// the behaviour these variables had when they were read through `$env/dynamic/*` before the
// SvelteKit 3 migration, where consumers fed them to `isTruthy()` or compared against `'true'`.
//
// It is imported straight from the submodule source rather than through
// `@openshock/svelte-core/utils` because SvelteKit evaluates this module in a plain Node context to
// resolve `static` values, and that barrel reaches `clipboard.svelte.ts` -> `svelte-sonner` -> a
// `.svelte` file, which Node cannot load. Reaching the file directly keeps one definition and skips
// the barrel.
import { isTruthy } from '../packages/svelte-core/src/lib/utils/parse';

/** Required free text, trimmed. Throws when unset or blank. */
function text(label: string) {
  return (value: string | undefined): string => {
    const trimmed = value?.trim() ?? '';
    if (!trimmed) throw new Error(`${label} must be set to a non-empty value`);
    return trimmed;
  };
}

/** Optional free text, trimmed. Unset or blank becomes `''`. */
function optionalText(value: string | undefined): string {
  return value?.trim() ?? '';
}

/**
 * Parses an absolute `http:` / `https:` URL and returns it as a trimmed string rather than a
 * `URL` instance. Strings stay inlinable for `static` variables and devalue-serializable for
 * dynamic public ones, and every consumer already builds its own `URL` from these.
 *
 * @param strict - Additionally require `https:` and reject query strings and hash fragments.
 */
function parseUrl(label: string, value: string, strict: boolean): string {
  let url: URL;
  try {
    url = new URL(value);
  } catch (error) {
    throw new Error(`${label} is not a valid absolute URL: ${value}`, { cause: error });
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error(`${label} must be an http: or https: URL, got ${url.protocol}`);
  }

  if (strict) {
    if (url.protocol !== 'https:') {
      throw new Error(`${label} must be an HTTPS URL`);
    }
    if (url.search || url.hash) {
      throw new Error(`${label} must not contain query parameters or hash fragments`);
    }
  }

  return value.trim();
}

/**
 * Required absolute URL.
 *
 * `strict` mirrors the checks `getApiUrl()` in `#lib/utils/url.ts` performs. They are duplicated
 * deliberately: validating here fails the build or boot immediately on a misconfigured
 * deployment, while the copies in `url.ts` stay covered by `url.test.ts`, which mocks
 * `$app/env/public` and so never runs these schemas.
 */
function url(label: string, { strict = false } = {}) {
  return (value: string | undefined): string => {
    const trimmed = value?.trim() ?? '';
    if (!trimmed) throw new Error(`${label} must be set to an absolute URL`);
    return parseUrl(label, trimmed, strict);
  };
}

/** Optional absolute URL. Unset or blank becomes `''` so consumers can `||` to a fallback. */
function optionalUrl(label: string) {
  return (value: string | undefined): string => {
    const trimmed = value?.trim() ?? '';
    if (!trimmed) return '';
    return parseUrl(label, trimmed, false);
  };
}

export const variables = defineEnvVars({
  // --- Site identity -------------------------------------------------------------------------
  PUBLIC_SITE_NAME: {
    public: true,
    static: true,
    description: 'Display name of the deployment, used in page titles and metadata.',
    schema: text('PUBLIC_SITE_NAME'),
  },
  PUBLIC_SITE_DESCRIPTION: {
    public: true,
    static: true,
    description: 'One-sentence description of the deployment, used in metadata and llms.txt.',
    schema: text('PUBLIC_SITE_DESCRIPTION'),
  },
  PUBLIC_SITE_URL: {
    public: true,
    static: true,
    description:
      "Public origin of the deployment. Its pathname also determines kit's `base` path, which " +
      '`vite.config.ts` derives separately at build time.',
    schema: url('PUBLIC_SITE_URL'),
  },
  PUBLIC_SITE_SHORT_URL: {
    public: true,
    static: true,
    description: 'Origin of the short-link domain used for share links.',
    schema: url('PUBLIC_SITE_SHORT_URL'),
  },
  PUBLIC_GITHUB_PROJECT_URL: {
    public: true,
    static: true,
    description: 'Project source URL, shown in the footer, header and the X-Source-Code header.',
    schema: url('PUBLIC_GITHUB_PROJECT_URL'),
  },
  PUBLIC_DISCORD_INVITE_URL: {
    public: true,
    static: true,
    description: 'Community Discord invite, linked from the header, footer and help dialog.',
    schema: url('PUBLIC_DISCORD_INVITE_URL'),
  },

  // --- Backend -------------------------------------------------------------------------------
  PUBLIC_BACKEND_API_URL: {
    public: true,
    static: true,
    description:
      'Base URL of the OpenShock API. Must be HTTPS with no query string or fragment, since ' +
      'paths are appended to it.',
    schema: url('PUBLIC_BACKEND_API_URL', { strict: true }),
  },
  PRIVATE_BACKEND_TLS_INSECURE: {
    description:
      "INSECURE. Disables TLS certificate validation for the server's own outgoing requests, " +
      'allowing SSR/API calls to a backend using a self-signed certificate. Only for ' +
      'development or an isolated self-hosted network; leave unset in production. Read at ' +
      'runtime so it can be set as a container env var without rebuilding.',
    schema: isTruthy,
  },

  // --- Feature switches ----------------------------------------------------------------------
  PUBLIC_DEVELOPMENT_BANNER: {
    public: true,
    static: true,
    description: 'Shows the "development deployment" banner above the app shell.',
    schema: isTruthy,
  },
  PUBLIC_DISABLE_ONBOARDING: {
    public: true,
    static: true,
    description: 'Suppresses the first-run onboarding tour.',
    schema: isTruthy,
  },
  PUBLIC_DISABLE_SHOCKER_MAP: {
    public: true,
    static: true,
    description:
      'Hides the shocker map control module. Static, so the map code is tree-shaken out of the ' +
      'client bundle when this is set.',
    schema: isTruthy,
  },
  PUBLIC_TURNSTILE_DEV_BYPASS_VALUE: {
    public: true,
    static: true,
    description:
      'Token handed to callers in place of a real Turnstile solve when the widget is bypassed ' +
      'in development. Must be a value the backend rejects in production.',
    schema: text('PUBLIC_TURNSTILE_DEV_BYPASS_VALUE'),
  },

  // --- Crawlers and metadata routes ----------------------------------------------------------
  // Dynamic rather than static so a deployment can flip them without a rebuild.
  PUBLIC_DISABLE_SITEMAP: {
    public: true,
    description: 'Makes /sitemap.xml return 404 and drops its reference from /robots.txt.',
    schema: isTruthy,
  },
  PUBLIC_DENY_ROBOTS: {
    public: true,
    description: 'Serves a blanket disallow from /robots.txt.',
    schema: isTruthy,
  },
  PUBLIC_DISABLE_LLMS_TXT: {
    public: true,
    description: 'Makes /llms.txt return 404.',
    schema: isTruthy,
  },

  // --- Telemetry (SigNoz / OpenTelemetry) ----------------------------------------------------
  PUBLIC_SIGNOZ_LOGS_ENABLED: {
    public: true,
    static: true,
    description:
      'Deployment kill-switch for every telemetry signal, not just logs. With this off, no ' +
      'consent prompt is shown and nothing is shipped.',
    schema: isTruthy,
  },
  PUBLIC_SIGNOZ_LOGS_URL: {
    public: true,
    static: true,
    description: 'OTLP logs endpoint. Defaults to the collector origin + /v1/logs when left empty.',
    schema: optionalUrl('PUBLIC_SIGNOZ_LOGS_URL'),
  },
  PUBLIC_SIGNOZ_TRACES_URL: {
    public: true,
    static: true,
    description:
      'OTLP traces endpoint for API-call tracing. Defaults to the logs collector origin + ' +
      '/v1/traces when left empty.',
    schema: optionalUrl('PUBLIC_SIGNOZ_TRACES_URL'),
  },
  PUBLIC_SIGNOZ_TRACE_PROPAGATION: {
    public: true,
    static: true,
    description:
      'Propagates W3C trace context (traceparent/tracestate) to the backend API. Requires the ' +
      'backend CORS config to allow those request headers, so off by default.',
    schema: isTruthy,
  },
  PUBLIC_SIGNOZ_DEPLOYMENT_ENVIRONMENT: {
    public: true,
    static: true,
    description:
      'Value of the `deployment.environment` resource attribute. Falls back to the build mode ' +
      '(development/production) when left empty.',
    schema: optionalText,
  },
  PUBLIC_SIGNOZ_RESOURCE_ATTRIBUTES: {
    public: true,
    static: true,
    description:
      'Extra OTel resource attributes as comma-separated key=value pairs, matching the standard ' +
      'OTEL_RESOURCE_ATTRIBUTES format. Example: deployment.region=eu,team=frontend',
    schema: optionalText,
  },
});

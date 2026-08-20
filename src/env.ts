import { defineEnvVars } from '@sveltejs/kit/env';

// The variables below without `static: true` were read through `$env/dynamic/*` before the
// SvelteKit 3 migration, so they were `undefined` when unset. `schema: (input) => input ?? ''`
// keeps that behaviour: every consumer feeds them to `isTruthy()` (or compares to `'true'`),
// for which an empty string is falsy just like `undefined` was.
export const variables = defineEnvVars({
  PRIVATE_BACKEND_TLS_INSECURE: { schema: (input) => input ?? '' },
  PUBLIC_GITHUB_PROJECT_URL: { public: true, static: true },
  PUBLIC_SIGNOZ_DEPLOYMENT_ENVIRONMENT: { public: true, static: true },
  PUBLIC_SIGNOZ_LOGS_ENABLED: { public: true, static: true },
  PUBLIC_SIGNOZ_LOGS_URL: { public: true, static: true },
  PUBLIC_SIGNOZ_TRACES_URL: { public: true, static: true },
  PUBLIC_SITE_NAME: { public: true, static: true },
  PUBLIC_DEVELOPMENT_BANNER: { public: true, static: true },
  PUBLIC_DISCORD_INVITE_URL: { public: true, static: true },
  PUBLIC_DISABLE_SITEMAP: { public: true, schema: (input) => input ?? '' },
  PUBLIC_DENY_ROBOTS: { public: true, schema: (input) => input ?? '' },
  PUBLIC_DISABLE_LLMS_TXT: { public: true, schema: (input) => input ?? '' },
  PUBLIC_SITE_DESCRIPTION: { public: true, static: true },
  PUBLIC_DISABLE_SHOCKER_MAP: { public: true, static: true },
  PUBLIC_BACKEND_API_URL: { public: true, static: true },
  PUBLIC_SITE_SHORT_URL: { public: true, static: true },
  PUBLIC_SITE_URL: { public: true, static: true },
  PUBLIC_DISABLE_ONBOARDING: { public: true, static: true },
  PUBLIC_SIGNOZ_RESOURCE_ATTRIBUTES: { public: true, static: true },
  PUBLIC_SIGNOZ_TRACE_PROPAGATION: { public: true, static: true },
  PUBLIC_TURNSTILE_DEV_BYPASS_VALUE: { public: true, static: true },
});

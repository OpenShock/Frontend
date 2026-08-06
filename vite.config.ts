/// <reference types="vitest/config" />
import adapterCloudflare from '@sveltejs/adapter-cloudflare';
import adapterNode from '@sveltejs/adapter-node';
import { type KitConfig } from '@sveltejs/kit';
import { sveltekit } from '@sveltejs/kit/vite';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import tailwindcss from '@tailwindcss/vite';
import * as child_process from 'node:child_process';
import { env } from 'node:process';
import { fileURLToPath } from 'node:url';
import license from 'rollup-plugin-license';
import { type Plugin, type PluginOption, type UserConfig, defineConfig, loadEnv } from 'vite';
import devtoolsJson from 'vite-plugin-devtools-json';
import mkcert from 'vite-plugin-mkcert';
import { localDevChecksPlugin } from './vite-plugins/local-dev-checks.ts';

function jsBannerPlugin(banner: string): Plugin {
  // Matches preserved/legal comment markers that OXC's minifier strips when
  // `output.comments.legal === false`: `/*!` starts, plus `@license`,
  // `@preserve`, and `@cc_on` JSDoc annotations.
  const LEGAL_COMMENT_RE = /\/\*!|@(?:license|preserve|cc_on)\b/;
  const modulesWithLegal = new Set<string>();

  return {
    name: 'js-banner',
    enforce: 'post',
    buildStart() {
      modulesWithLegal.clear();
    },
    transform(code, id) {
      if (LEGAL_COMMENT_RE.test(code)) {
        modulesWithLegal.add(id);
      }
      return null;
    },
    generateBundle(_, bundle) {
      for (const chunk of Object.values(bundle)) {
        if (chunk.type !== 'chunk') continue;
        const hasLegal = Object.keys(chunk.modules).some((id) => modulesWithLegal.has(id));
        if (hasLegal) {
          chunk.code = banner + '\n' + chunk.code;
          // The banner adds one generated line — shift the sourcemap mappings down
          // by one to match (a leading ';' is an empty line in the VLQ encoding).
          if (chunk.map) {
            chunk.map.mappings = ';' + chunk.map.mappings;
          }
        }
      }
    },
  };
}

const isTruthy = (value?: string) => value === 'true' || value === '1';

// ---------------------------------------------------------------------------
// SvelteKit configuration (previously svelte.config.js). Passing it to the
// sveltekit() plugin is supported since kit 2.62 and keeps environment
// detection, adapter selection, and the CSP in a single, type-checked file.
// ---------------------------------------------------------------------------

// Determine if we are running on Cloudflare Workers Builds
const isGithubActions = isTruthy(env.GITHUB_ACTIONS);
const isCloudflare = isTruthy(env.WORKERS_CI);
const isDocker = isTruthy(env.DOCKER);
// Don't trust NODE_ENV — tools like svelte-check load this file mid-process and
// can have NODE_ENV='production' set by transitively-imported plugins (vite,
// vite-plugin-svelte) even though no production build is actually happening.
// `pnpm build`/`pnpm preview` set BUILD_ENV=production explicitly via cross-env;
// CI/Cloudflare/Docker each have their own flag.
const isProductionBuild =
  isGithubActions || isCloudflare || isDocker || env.BUILD_ENV === 'production';
const buildMode = isProductionBuild ? 'production' : 'development';

const dotenv = { ...env, ...loadEnv(buildMode, process.cwd(), 'PUBLIC_') };

function getGitHash(): string | undefined {
  if (isGithubActions) return env.GITHUB_SHA;
  if (isCloudflare) return env.WORKERS_CI_COMMIT_SHA;
  if (isDocker) return env.GIT_COMMIT_SHA;

  return child_process.execSync('git rev-parse HEAD').toString().trim();
}

function getWsUrlFromHttpUrl(url: string | undefined): string {
  if (!url || (!url.startsWith('https://') && !url.startsWith('http://'))) {
    throw new Error(`Invalid URL [${url}]`);
  }

  return url.replace(/^http/, 'ws');
}

function getOrigin(url: string | undefined): string {
  try {
    return new URL(url ?? '').origin;
  } catch (error) {
    throw new Error(`Invalid URL [${url}]`, { cause: error });
  }
}

function getSvelteBasePath(): '' | `/${string}` {
  try {
    const url = new URL(dotenv.PUBLIC_SITE_URL ?? '');
    // URL.pathname always starts with '/', which the KitConfig type can't know.
    return url.pathname === '/' ? '' : (url.pathname as `/${string}`);
  } catch (error) {
    throw new Error(`PUBLIC_SITE_URL is not a valid URL: ${dotenv.PUBLIC_SITE_URL}`, {
      cause: error,
    });
  }
}

// CspDirectives itself isn't exported by @sveltejs/kit — derive it from the
// (exported) KitConfig type instead of duplicating its shape here.
type CspDirectives = NonNullable<NonNullable<KitConfig['csp']>['directives']>;

const commitHash = getGitHash();

// kit options sit at the top level here — the only layout difference to svelte.config.js.
const sveltekitConfig = {
  preprocess: vitePreprocess(),
  vitePlugin: {
    inspector: true,
  },
  compilerOptions: {
    runes: true,
    // Await expressions in components (script top level, $derived, markup).
    // The flag disappears in Svelte 6, where this becomes the default.
    experimental: {
      async: true,
    },
  },
  // Use the appropriate adapter
  adapter: isCloudflare ? adapterCloudflare() : adapterNode(),
  paths: {
    base: getSvelteBasePath(),
  },
  csp: {
    mode: 'nonce',
    // Cast: several sources are runtime strings (PUBLIC_* env), which can't be checked
    // against the HostSource template-literal types at compile time.
    directives: {
      'default-src': ['self'],
      'frame-src': ['https://challenges.cloudflare.com'],
      // Explicit rather than inherited: without it, worker-src would fall back to
      // script-src and pick up the third-party script hosts allowed there.
      'worker-src': ['self'],
      'style-src': ['self', 'unsafe-inline'],
      'img-src': ['self', 'https://*.wp.com', 'https://www.gravatar.com'],
      'connect-src': [
        'self',
        dotenv.PUBLIC_BACKEND_API_URL,
        getWsUrlFromHttpUrl(dotenv.PUBLIC_BACKEND_API_URL),
        dotenv.PUBLIC_GATEWAY_CSP_WILDCARD,
        getWsUrlFromHttpUrl(dotenv.PUBLIC_GATEWAY_CSP_WILDCARD),
        'https://firmware.openshock.org',
        'https://api.pwnedpasswords.com/range/',
        'https://cloudflareinsights.com',
        // SigNoz / OpenTelemetry log + trace shipping endpoint origins.
        getOrigin(dotenv.PUBLIC_SIGNOZ_LOGS_URL),
        getOrigin(dotenv.PUBLIC_SIGNOZ_TRACES_URL),
      ],
      'script-src': [
        'self',
        'https://challenges.cloudflare.com/turnstile/',
        'https://static.cloudflareinsights.com',
      ],
      'object-src': ['none'],
      'base-uri': ['self'],
      // form-action does NOT fall back to default-src — without it, injected HTML
      // could point a <form> at an attacker origin. The API origin is needed for the
      // OAuth buttons' cross-origin POST; note Chrome also enforces form-action on
      // the post-submit redirect to the OAuth provider.
      'form-action': ['self', dotenv.PUBLIC_BACKEND_API_URL],
      // Ignored on prerendered pages (meta-tag CSP) — the _headers file's
      // X-Frame-Options covers those on Cloudflare, but nothing does on the
      // Node/Docker deploy: adapter-node serves prerendered HTML through sirv
      // before the SvelteKit handler, so hooks.server.ts `handle` never runs for
      // it. Moot while `prerender = false` in src/routes/+layout.ts; revisit if
      // any route starts prerendering.
      'frame-ancestors': ['none'],
    } as CspDirectives,
  },
  version: {
    name: commitHash,
  },
  experimental: {
    // Server-side OpenTelemetry spans for handle/load/form actions, collected by
    // src/instrumentation.server.ts. Experimental (kit ≥2.31).
    tracing: { server: true },
    instrumentation: { server: true },
  },
} satisfies Parameters<typeof sveltekit>[0];

interface LocalServer {
  /** Vite `server` config (host/port + dev niceties). */
  config: {
    forwardConsole: boolean;
    host: string;
    port: number;
    fs: { allow: string[] };
  };
  /**
   * FQDN that needs a hosts redirect and a privileged-port bind before serving,
   * or null for plain `localhost` (no redirect/bind checks required).
   */
  fqdn: string | null;
}

// Pure: only computes host/port from the already-loaded env. No DNS lookups and
// no socket binds — so it is safe to evaluate during `svelte-kit sync`,
// `svelte-check`, codegen, and builds. The actual server-only side effects live
// in vite-plugins/local-dev-checks.ts.
function resolveServerConfig(useLocalRedirect: boolean): LocalServer | undefined {
  if (!useLocalRedirect) return undefined;

  // Vite 8: pipe browser console errors/warnings into the dev terminal so client
  // errors land alongside server logs without context-switching to devtools.
  //
  // `@openshock/svelte-core` is a workspace package consumed from source. pnpm
  // symlinks it into node_modules, but Vite resolves symlinks to their real path
  // (packages/svelte-core/src/...), which falls outside SvelteKit's default
  // fs.allow list. Allow the package dir so its source modules can be served.
  const baseDevConfig = {
    forwardConsole: true,
    fs: { allow: ['./packages/svelte-core'] },
  };

  // PUBLIC_SITE_URL was already validated at module load by getSvelteBasePath().
  const domain = new URL(dotenv.PUBLIC_SITE_URL!).hostname;

  if (domain === 'localhost') {
    return { config: { ...baseDevConfig, host: 'localhost', port: 8080 }, fqdn: null };
  }

  const host = domain.startsWith('local.') ? domain : `local.${domain}`;
  return { config: { ...baseDevConfig, host, port: 443 }, fqdn: host };
}

export default defineConfig(({ command, mode, isPreview }) => {
  const isLocalServe = command === 'serve' || isPreview === true;
  const isProduction = mode === 'production' && (isTruthy(env.DOCKER) || isTruthy(env.WORKERS_CI));
  // Vitest resolves this config with command 'serve', unit tests must never trigger mkcert or the hosts/port checks.
  const isTest = mode === 'test' || isTruthy(env.VITEST);

  // Serve locally at https://local.<domain> (mkcert cert + hosts entry) so the frontend shares cookies with the API.
  const useLocalRedirect = isLocalServe && !isProduction && !isTest && !isTruthy(env.CI);

  const server = resolveServerConfig(useLocalRedirect);

  return {
    resolve: {
      // Redirect the generated API client's bare `temporal-polyfill` imports to a
      // shim that only loads the polyfill when the runtime lacks native Temporal
      // (only Safari, as of 2026). Exact-match regex so `temporal-polyfill/global`
      // inside the shim still resolves to the real package.
      alias: [
        {
          find: /^temporal-polyfill$/,
          replacement: fileURLToPath(new URL('./src/lib/temporal-shim.ts', import.meta.url)),
        },
      ],
    },
    build: {
      rolldownOptions: {
        output: {
          comments: { legal: false },
        },
        optimization: {
          inlineConst: { pass: 2 },
        },
        treeshake:
          mode === 'production'
            ? { manualPureFunctions: ['console.log', 'console.debug', 'console.trace'] }
            : undefined,
      },
    },
    plugins: [
      server ? mkcert() : undefined,
      server?.fqdn ? localDevChecksPlugin(server.fqdn, server.config.port) : undefined,
      jsBannerPlugin('/*! For licenses information, see LICENSES.txt */'),
      tailwindcss(),
      sveltekit(sveltekitConfig),
      devtoolsJson(),
      license({
        thirdParty: {
          includePrivate: true,
          includeSelf: true,
          multipleVersions: true,
          output: {
            file: './.svelte-kit/output/client/LICENSES.txt', // TODO: This seems like a hack, check if theres a better way...
          },
        },
      }) as PluginOption, // TODO: Figure out why typescript thinks this is incompatible ("as PluginOption" is mandatory for svelte check to succeed)
    ],
    server: server?.config,
    preview: server ? { port: server.config.port } : undefined,
    test: {
      // A test that runs no assertions fails instead of silently passing.
      expect: { requireAssertions: true },
      projects: [
        {
          extends: true,
          test: {
            name: 'server',
            include: ['src/**/*.{test,spec}.{js,ts}'],
            exclude: ['src/**/*.svelte.{test,spec}.{js,ts}'],
          },
        },
      ],
    },
  } satisfies UserConfig;
});

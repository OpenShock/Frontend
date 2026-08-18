/// <reference types="vitest/config" />
import adapterCloudflare from '@sveltejs/adapter-cloudflare';
import adapterNode from '@sveltejs/adapter-node';
import { type KitConfig } from '@sveltejs/kit';
import { sveltekit } from '@sveltejs/kit/vite';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import tailwindcss from '@tailwindcss/vite';
import * as child_process from 'node:child_process';
import { env } from 'node:process';
import license from 'rollup-plugin-license';
import { type Plugin, type PluginOption, type UserConfig, defineConfig, loadEnv } from 'vite';
import devtoolsJson from 'vite-plugin-devtools-json';
import mkcert from 'vite-plugin-mkcert';
import { localDevChecksPlugin } from './vite-plugins/local-dev-checks.ts';

type PublicEnv = ReturnType<typeof loadPublicEnv>;
type KitConfigParam = Parameters<typeof sveltekit>[0];

// CspDirectives itself isn't exported by @sveltejs/kit — derive it from the
// (exported) KitConfig type instead of duplicating its shape here.
type CspDirectives = NonNullable<NonNullable<KitConfig['csp']>['directives']>;

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

/**
 * PUBLIC_* values for a given Vite mode.
 *
 * This has to key off Vite's own `mode`, because that is what SvelteKit uses to
 * resolve `$env/static/public` — the values the client is actually compiled
 * against. Deriving it from anything else (NODE_ENV, a BUILD_ENV flag, CI
 * detection) lets the CSP below be built from one .env file while the client is
 * built from another; the symptom is the app's own connect-src blocking the API
 * base URL it was compiled to call, because `.env` and `.env.development` point
 * at different hosts.
 */
function loadPublicEnv(mode: string) {
  return { ...env, ...loadEnv(mode, process.cwd(), 'PUBLIC_') };
}

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

function getSvelteBasePath(dotenv: PublicEnv): '' | `/${string}` {
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

const commitHash = getGitHash();

// kit options sit at the top level here — the only layout difference to svelte.config.js.
function buildSveltekitConfig(dotenv: PublicEnv): KitConfigParam {
  return {
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
      base: getSvelteBasePath(dotenv),
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
          dotenv.PUBLIC_FIRMWARE_REPO_URL,
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
        // OAuth buttons' cross-origin POST; the identity providers are needed because
        // that POST answers with a 302 to them, and Chrome re-checks form-action on
        // every hop of a form submission's redirect chain. Listed unconditionally —
        // a provider the backend doesn't offer is simply never navigated to.
        //
        // These are the browser-facing authorization endpoints of the backend's
        // handlers, not their token/userinfo endpoints (those are server-to-server and
        // never navigated to). X needs both hosts: the handler builds a twitter.com
        // URL, which 301s to x.com inside the same navigation.
        'form-action': [
          'self',
          dotenv.PUBLIC_BACKEND_API_URL,
          'https://discord.com',
          'https://accounts.google.com',
          'https://twitter.com',
          'https://x.com',
        ],
        // Ignored on prerendered pages (meta-tag CSP) — the _headers file's
        // X-Frame-Options covers those on Cloudflare.
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
  };
}

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
function resolveServerConfig(
  useLocalRedirect: boolean,
  dotenv: PublicEnv
): LocalServer | undefined {
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
  // Resolved here, from Vite's mode, so the CSP in buildSveltekitConfig always
  // agrees with the `$env/static/public` values the client is compiled against.
  const dotenv = loadPublicEnv(mode);

  const isLocalServe = command === 'serve' || isPreview === true;
  const isProduction = mode === 'production' && (isTruthy(env.DOCKER) || isTruthy(env.WORKERS_CI));
  // Vitest resolves this config with command 'serve', unit tests must never trigger mkcert or the hosts/port checks.
  const isTest = mode === 'test' || isTruthy(env.VITEST);

  // Serve locally at https://local.<domain> (mkcert cert + hosts entry) so the frontend shares cookies with the API.
  const useLocalRedirect = isLocalServe && !isProduction && !isTest && !isTruthy(env.CI);

  const server = resolveServerConfig(useLocalRedirect, dotenv);

  return {
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
      sveltekit(buildSveltekitConfig(dotenv)),
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

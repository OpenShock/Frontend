import adapterCloudflare from '@sveltejs/adapter-cloudflare';
import adapterNode from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import * as child_process from 'node:child_process';
import process from 'process';
import { loadEnv } from 'vite';

// Determine if we are running on Cloudflare Pages
const isGithubActions = process.env.GITHUB_ACTIONS === 'true';
const isCloudflare = process.env.CF_PAGES === '1';
const isDocker = process.env.DOCKER === 'true';
const mode = process.env.NODE_ENV;

const dotenv = { ...process.env, ...loadEnv(mode, process.cwd(), 'PUBLIC_') };

// Use the appropriate adapter
const adapter = isCloudflare ? adapterCloudflare : adapterNode;

function getGitHash() {
  if (isGithubActions) return process.env.GITHUB_SHA;
  if (isCloudflare) return process.env.CF_COMMIT_SHA;
  if (isDocker) return process.env.GIT_COMMIT_SHA;

  return child_process.execSync('git rev-parse HEAD').toString().trim();
}
function getGitBranch() {
  if (isGithubActions) return process.env.GITHUB_REF_NAME;
  if (isCloudflare) return process.env.CF_BRANCH;
  if (isDocker) return process.env.GIT_BRANCH;

  return child_process.execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
}

const commitHash = getGitHash();
const branchName = getGitBranch();

/** @type {import('@sveltejs/kit').Config} */
const config = {
  extensions: ['.svelte'],
  // Consult https://kit.svelte.dev/docs/integrations#preprocessors
  // for more information about preprocessors
  preprocess: vitePreprocess(),
  vitePlugin: {
    inspector: mode === 'development',
  },
  compilerOptions: {
    runes: true,
    modernAst: true,
  },
  kit: {
    adapter: adapter(),
    csp: {
      mode: 'hash',
      directives: {
        'default-src': ['self'],
        'child-src': ['https://challenges.cloudflare.com'],
        'frame-src': ['https://challenges.cloudflare.com'], // Deprecated
        'style-src': ['self', 'unsafe-inline'],
        'img-src': [
          'self',
          'https://www.gravatar.com',
          'https://i0.wp.com/openshock.app/static/images/',
          'https://i1.wp.com/openshock.app/static/images/',
          'https://i2.wp.com/openshock.app/static/images/',
        ],
        'connect-src': [
          'self',
          'https://' + dotenv.PUBLIC_BACKEND_API_DOMAIN,
          'wss://' + dotenv.PUBLIC_BACKEND_API_DOMAIN,
          'wss://' + dotenv.PUBLIC_GATEWAY_CSP_WILDCARD,
          'https://firmware.openshock.org',
          'https://api.pwnedpasswords.com/range/',
          'https://cloudflareinsights.com',
        ],
        'script-src': [
          'self',
          'https://challenges.cloudflare.com/turnstile/',
          'https://static.cloudflareinsights.com',
        ],
      },
    },
    version: {
      name: commitHash,
    },
  },
};
export default config;

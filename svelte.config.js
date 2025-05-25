import adapterCloudflare from '@sveltejs/adapter-cloudflare';
import adapterNode from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import dotenv from 'dotenv';
import * as child_process from 'node:child_process';
import process from 'process';

// Determine if we are running on Cloudflare Pages
const isGithubActions = process.env.GITHUB_ACTIONS === 'true';
const isCloudflare = process.env.CF_PAGES === '1';
const isDocker = process.env.DOCKER === 'true';

// Use the appropriate adapter
const adapter = isCloudflare ? adapterCloudflare : adapterNode;

function readEnv(path) {
  return dotenv.config({ path })?.parsed ?? {};
}

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

// Read environment variables from .env files
readEnv('.env.local');
readEnv(`.env.${process.env.NODE_ENV}`);
readEnv('.env');

const commitHash = getGitHash();
const branchName = getGitBranch();

/** @type {import('@sveltejs/kit').Config} */
const config = {
  extensions: ['.svelte'],
  // Consult https://kit.svelte.dev/docs/integrations#preprocessors
  // for more information about preprocessors
  preprocess: vitePreprocess(),

  vitePlugin: {
    inspector: process.env.NODE_ENV === 'development',
  },
  kit: {
    adapter: adapter({
      routes: {
        include: ['/*'],
        exclude: ['<all>'],
      },
    }),
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
          'https://' + process.env.PUBLIC_BACKEND_API_DOMAIN,
          'wss://' + process.env.PUBLIC_BACKEND_API_DOMAIN,
          'wss://' + process.env.PUBLIC_GATEWAY_CSP_WILDCARD,
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

import * as child_process from 'node:child_process';
import adapterCloudflare from '@sveltejs/adapter-cloudflare';
import adapterNode from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import dotenv from 'dotenv';
import process from 'process';

// Determine if we are running on Cloudflare Pages
const isCloudflare = process.env.CF_PAGES === '1';

// Use the appropriate adapter
const adapter = isCloudflare ? adapterCloudflare : adapterNode;

function readEnv(path) {
  return dotenv.config({ path })?.parsed ?? {};
}

const env = {
  ...readEnv('.env'),
  ...readEnv(`.env.${process.env.NODE_ENV}`),
  ...readEnv('.env.local'),
  ...process.env,
};

/** @type {import('@sveltejs/kit').Config} */
const config = {
  extensions: ['.svelte'],
  // Consult https://kit.svelte.dev/docs/integrations#preprocessors
  // for more information about preprocessors
  preprocess: [vitePreprocess()],

  vitePlugin: {
    inspector: true,
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
          'https://' + env.PUBLIC_BACKEND_API_DOMAIN,
          'wss://' + env.PUBLIC_BACKEND_API_DOMAIN,
          'wss://' + env.PUBLIC_GATEWAY_CSP_WILDCARD,
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
      name: process.env.GIT_HASH ?? child_process.execSync('git rev-parse HEAD').toString().trim(),
    },
  },
};
export default config;

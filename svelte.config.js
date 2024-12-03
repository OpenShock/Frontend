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
  ...process.env,
  ...readEnv('.env'),
  ...readEnv(`.env.${process.env.NODE_ENV}`),
  ...readEnv('.env.local'),
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
        'connect-src': [
          'self',
          'https://*.' + env.PUBLIC_SITE_DOMAIN,
          'wss://*.' + env.PUBLIC_SITE_DOMAIN,
          'https://firmware.openshock.org',
          'https://api.pwnedpasswords.com',
        ],
        'script-src': [
          'self',
          'https://challenges.cloudflare.com',
          'https://static.cloudflareinsights.com',
        ],
        'frame-src': ['https://challenges.cloudflare.com'],
      },
    },
    version: {
      name: process.env.GIT_HASH ?? child_process.execSync('git rev-parse HEAD').toString().trim(),
    },
  },
};
export default config;

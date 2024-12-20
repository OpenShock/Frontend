import * as child_process from 'node:child_process';
import adapterCloudflare from '@sveltejs/adapter-cloudflare';
import adapterNode from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import process from 'process';

// Determine if we are running on Cloudflare Pages
const isCloudflare = process.env.CF_PAGES === '1';

// Use the appropriate adapter
const adapter = isCloudflare ? adapterCloudflare : adapterNode;

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
    version: {
      name: process.env.GIT_HASH ?? child_process.execSync('git rev-parse HEAD').toString().trim(),
    },
  },
};
export default config;

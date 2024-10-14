import { default as adapterCloudflare } from '@sveltejs/adapter-cloudflare';
import { default as adapterNode } from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { env } from 'process';

// Determine if we are running on Cloudflare Pages
const isCloudflare = env.CF_PAGES === '1';

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
  },
};
export default config;

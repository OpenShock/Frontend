import { join } from 'path'
import type { Config } from 'tailwindcss'
import { skeleton } from '@skeletonlabs/skeleton/plugin';
import { openshockTheme } from './openshock-theme';

export default {
  darkMode: 'class',
  content: ['./src/**/*.{html,js,svelte,ts}', join(require.resolve('@skeletonlabs/skeleton-svelte'), '../**/*.{html,js,svelte,ts}')],
  theme: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    skeleton({
      themes: [
        openshockTheme
      ],
    }),
  ],

} as Config;

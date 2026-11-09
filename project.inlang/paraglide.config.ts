import { defineConfig } from '@inlang/paraglide-js';

export default defineConfig({
  outdir: './src/lib/paraglide',
  emitTsDeclarations: true,
  // Pinned so the CLI (used by `check`) and the Vite plugin emit the same layout.
  outputStructure: 'message-modules',
  // `custom-query` is the one-off `?lang=` override, see src/lib/i18n/query-locale.ts.
  strategy: ['custom-query', 'cookie', 'preferredLanguage', 'baseLocale'],
  cookieSameSite: 'lax',
  cookieSecure: 'auto',
});

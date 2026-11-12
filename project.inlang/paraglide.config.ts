import { defineConfig } from '@inlang/paraglide-js';

export default defineConfig({
  outdir: './src/lib/paraglide',
  emitTsDeclarations: true,
  // Pinned so the CLI (used by `check`) and the Vite plugin emit the same layout.
  outputStructure: 'message-modules',
  // `custom-preferred` replaces `preferredLanguage` to map zh-CN and zh-TW to our Chinese locales, see src/lib/i18n/preferred-locale.ts.
  strategy: ['cookie', 'custom-preferred', 'baseLocale'],
  cookieSameSite: 'lax',
  cookieSecure: 'auto',
});

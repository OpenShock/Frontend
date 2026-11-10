import { defineConfig } from '@inlang/paraglide-js';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const { locales } = JSON.parse(
  readFileSync(join(process.cwd(), 'project.inlang', 'settings.json'), 'utf8')
) as { locales: string[] };

/**
 * Locale-prefixed URLs for the landing page only, e.g. `/de`.
 * Every other path matches no pattern, so the `url` strategy skips it and the cookie decides.
 * vite.config.ts calls this again with the SvelteKit base path.
 */
export function landingUrlPatterns(basePath: '' | `/${string}`) {
  const origin = ':protocol://:domain(.*)::port?';
  return [
    {
      pattern: `${origin}${basePath}/`,
      localized: locales.map((locale) => [locale, `${origin}${basePath}/${locale}`]) as [
        string,
        string,
      ][],
    },
  ];
}

export default defineConfig({
  outdir: './src/lib/paraglide',
  emitTsDeclarations: true,
  // Pinned so the CLI (used by `check`) and the Vite plugin emit the same layout.
  outputStructure: 'message-modules',
  // `custom-query` is the one-off `?lang=` override, see src/lib/i18n/query-locale.ts.
  // `url` gives the landing page a stable URL per language, see `landingUrlPatterns`.
  // `custom-preferred` replaces `preferredLanguage` to map zh-CN and zh-TW to our Chinese locales, see src/lib/i18n/preferred-locale.ts.
  strategy: ['custom-query', 'url', 'cookie', 'custom-preferred', 'baseLocale'],
  urlPatterns: landingUrlPatterns(''),
  // So `/de/` resolves like `/de`.
  trailingSlash: 'never',
  cookieSameSite: 'lax',
  cookieSecure: 'auto',
});

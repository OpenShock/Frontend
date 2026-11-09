import { getLocale, type Locale } from '#lib/paraglide/runtime.js';

const OG_LOCALES: Record<Locale, string> = {
  en: 'en_US',
  de: 'de_DE',
  nb: 'nb_NO',
};

/** The current locale in the `language_TERRITORY` form `og:locale` expects. */
export function openGraphLocale(): string {
  return OG_LOCALES[getLocale()];
}

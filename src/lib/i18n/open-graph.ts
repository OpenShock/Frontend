import { getLocale, type Locale } from '#lib/paraglide/runtime.js';

const OG_LOCALES: Record<Locale, string> = {
  en: 'en_US',
  de: 'de_DE',
  nb: 'nb_NO',
  es: 'es_ES',
  sv: 'sv_SE',
  fi: 'fi_FI',
  fr: 'fr_FR',
  et: 'et_EE',
  // Not a real language, so it shares English's territory.
  uwu: 'en_US',
};

/** The current locale in the `language_TERRITORY` form `og:locale` expects. */
export function openGraphLocale(): string {
  return OG_LOCALES[getLocale()];
}

import {
  defineCustomClientStrategy,
  defineCustomServerStrategy,
  isLocale,
  overwriteSetLocale,
  setLocale,
  type Locale,
} from '#lib/paraglide/runtime.js';

/**
 * One-off locale override, e.g. `?lang=de`.
 * It applies while the parameter is in the URL and is never saved to the locale cookie.
 */
export const LOCALE_QUERY_PARAM = 'lang';

function localeFromUrl(url: URL): Locale | undefined {
  const value = url.searchParams.get(LOCALE_QUERY_PARAM);
  return value !== null && isLocale(value) ? value : undefined;
}

defineCustomServerStrategy('custom-query', {
  getLocale: (request) => (request ? localeFromUrl(new URL(request.url)) : undefined),
});

// Read once per document, so client-side navigation away from the `?lang=` URL keeps the
// whole page in one language until the next full load.
const override =
  typeof window === 'undefined' ? undefined : localeFromUrl(new URL(window.location.href));

defineCustomClientStrategy('custom-query', {
  getLocale: () => override,
  // Persisting is the cookie strategy's job; this one only ever reads the URL.
  setLocale: () => {},
});

if (override) {
  const originalSetLocale = setLocale;

  overwriteSetLocale((locale, options) => {
    // Paraglide calls `setLocale(resolved, { reload: false })` on the first `getLocale()` to
    // persist the detected locale. Skip it for the override so the cookie keeps the user's choice.
    if (options?.reload === false) {
      if (locale === override) return;
      return originalSetLocale(locale, options);
    }

    // An explicit pick (the language switcher) is saved, then the override is dropped from the
    // URL; otherwise the reload would resolve to the override again.
    originalSetLocale(locale, { reload: false });
    const url = new URL(window.location.href);
    url.searchParams.delete(LOCALE_QUERY_PARAM);
    window.location.href = url.href;
  });
}

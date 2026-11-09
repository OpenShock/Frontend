import {
  defineCustomClientStrategy,
  defineCustomServerStrategy,
  toLocale,
  type Locale,
} from '#lib/paraglide/runtime.js';

// Browsers send region tags like zh-CN or zh-TW, while our Chinese locales are named by script.
// These regions write Traditional Chinese, every other Chinese tag falls back to Simplified.
const TRADITIONAL_REGIONS = new Set(['tw', 'hk', 'mo']);

function chineseLocale(tag: string): Locale | undefined {
  const [language, ...subtags] = tag.toLowerCase().split('-');
  if (language !== 'zh') return undefined;
  if (subtags.includes('hant')) return toLocale('zh-Hant');
  if (subtags.includes('hans')) return toLocale('zh-Hans');
  return toLocale(subtags.some((s) => TRADITIONAL_REGIONS.has(s)) ? 'zh-Hant' : 'zh-Hans');
}

/**
 * The first supported locale in a list of language tags, most preferred first.
 * Matches like Paraglide's `preferredLanguage`: the full tag, then its base language, plus the Chinese mapping above.
 */
export function matchPreferredLocale(tags: readonly string[]): Locale | undefined {
  for (const tag of tags) {
    const locale = toLocale(tag) ?? chineseLocale(tag) ?? toLocale(tag.split('-')[0]);
    if (locale) return locale;
  }
  return undefined;
}

/** The language tags of an Accept-Language header, most preferred first, without those marked q=0. */
export function parseAcceptLanguage(header: string): string[] {
  return header
    .split(',')
    .map((part, index) => {
      const [tag = '', ...params] = part.split(';').map((p) => p.trim());
      const q = params.find((p) => p.startsWith('q='));
      return { tag, q: q ? Number(q.slice(2)) : 1, index };
    })
    .filter(({ tag, q }) => tag !== '' && tag !== '*' && q > 0)
    .sort((a, b) => b.q - a.q || a.index - b.index)
    .map(({ tag }) => tag);
}

defineCustomServerStrategy('custom-preferred', {
  getLocale: (request) => {
    const header = request?.headers.get('accept-language');
    return header ? matchPreferredLocale(parseAcceptLanguage(header)) : undefined;
  },
});

defineCustomClientStrategy('custom-preferred', {
  getLocale: () =>
    typeof navigator === 'undefined' ? undefined : matchPreferredLocale(navigator.languages ?? []),
  // Saving the choice is the cookie strategy's job.
  setLocale: () => {},
});

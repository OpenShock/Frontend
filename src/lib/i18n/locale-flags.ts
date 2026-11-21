import type { Locale } from '#lib/paraglide/runtime.js';
import cn from 'flag-icons/flags/4x3/cn.svg?no-inline';
import de from 'flag-icons/flags/4x3/de.svg?no-inline';
import ee from 'flag-icons/flags/4x3/ee.svg?no-inline';
import es from 'flag-icons/flags/4x3/es.svg?no-inline';
import fi from 'flag-icons/flags/4x3/fi.svg?no-inline';
import fr from 'flag-icons/flags/4x3/fr.svg?no-inline';
import jp from 'flag-icons/flags/4x3/jp.svg?no-inline';
import nl from 'flag-icons/flags/4x3/nl.svg?no-inline';
import no from 'flag-icons/flags/4x3/no.svg?no-inline';
import se from 'flag-icons/flags/4x3/se.svg?no-inline';
import tw from 'flag-icons/flags/4x3/tw.svg?no-inline';
import ua from 'flag-icons/flags/4x3/ua.svg?no-inline';

// Bundled SVGs rather than flag emoji, because Windows shows flag emoji as two letters.
// `?no-inline` keeps Vite from turning them into data: URLs, which the CSP's img-src blocks.
// Flags stand for countries, not languages, so English, which is spoken in too many places for
// any one flag, gets a neutral marker instead.
export type LocaleFlag = { src: string } | { emoji: string };

export const LOCALE_FLAGS: Record<Locale, LocaleFlag> = {
  en: { emoji: '🌐' },
  de: { src: de },
  nb: { src: no },
  es: { src: es },
  sv: { src: se },
  fi: { src: fi },
  fr: { src: fr },
  et: { src: ee },
  nl: { src: nl },
  uk: { src: ua },
  ja: { src: jp },
  'zh-Hans': { src: cn },
  'zh-Hant': { src: tw },
  // Not a real language, so it gets an emoji instead of a flag.
  uwu: { emoji: '🥺' },
};

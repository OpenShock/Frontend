import { getLocale } from '#lib/paraglide/runtime.js';

// The locale tag to hand to Intl APIs.
// uwu is not a real language, so it formats like English.
export function intlLocale(): string {
  const locale = getLocale();
  return locale === 'uwu' ? 'en' : locale;
}

// Formats how long ago an instant was, in the largest whole unit up to days.
export function formatRelativeTime(instant: Temporal.Instant): string {
  const tz = Temporal.Now.timeZoneId();
  const elapsed = instant
    .toZonedDateTimeISO(tz)
    .until(Temporal.Now.zonedDateTimeISO(tz), { largestUnit: 'day' });
  const format = new Intl.RelativeTimeFormat(intlLocale(), { numeric: 'auto', style: 'narrow' });

  if (elapsed.days > 0) return format.format(-elapsed.days, 'day');
  if (elapsed.hours > 0) return format.format(-elapsed.hours, 'hour');
  if (elapsed.minutes > 0) return format.format(-elapsed.minutes, 'minute');
  return format.format(0, 'second');
}

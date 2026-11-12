import { intlLocale } from '#lib/i18n/intl.js';
import { durationBetween } from '@openshock/svelte-core/utils';

const UNITS = ['years', 'months', 'days', 'hours', 'minutes', 'seconds'] as const;

// Picks the largest non-zero unit, like the svelte-core formatter, but words it in the app language.
function formatSignedDuration(duration: Temporal.Duration): string {
  const abs = duration.abs();
  const unit = UNITS.find((u) => abs[u] >= 1) ?? 'seconds';
  const format = new Intl.RelativeTimeFormat(intlLocale(), { numeric: 'always' });
  return format.format(duration.sign < 0 ? -abs[unit] : abs[unit], unit);
}

/**
 * Relative label for an instant, such as "in 3 days" or "2 hours ago".
 *
 * Pass `now` from reactive state to keep the label ticking; the default reads
 * the clock once and so is only correct at call time.
 */
export function formatRelativeInstant(
  instant: Temporal.Instant,
  now: Temporal.Instant = Temporal.Now.instant()
): string {
  return formatSignedDuration(durationBetween(now, instant));
}

export function formatRelativeInstantOrNull(
  instant: Temporal.Instant | null,
  now: Temporal.Instant = Temporal.Now.instant()
): string | null {
  if (instant === null) return null;
  return formatSignedDuration(durationBetween(now, instant));
}

/** Zero-padded HH:MM:SS for a duration in milliseconds. Hours keep growing past 24. */
export function formatClockDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const s = totalSeconds % 60;
  const m = Math.floor(totalSeconds / 60) % 60;
  const h = Math.floor(totalSeconds / 3600);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/** Wall-clock time of an instant in the local time zone, as HH:MM:SS. */
export function formatLocalTime(instant: Temporal.Instant): string {
  return instant
    .toZonedDateTimeISO(Temporal.Now.timeZoneId())
    .toPlainTime()
    .toString({ smallestUnit: 'second' });
}

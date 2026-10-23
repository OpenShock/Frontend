import { durationBetween, formatElapsed } from '@openshock/svelte-core/utils';

/**
 * Relative label for an instant — "in 3 days", "2 hours ago".
 *
 * Pass `now` from reactive state to keep the label ticking; the default reads
 * the clock once and so is only correct at call time.
 */
export function formatRelativeInstant(
  instant: Temporal.Instant,
  now: Temporal.Instant = Temporal.Now.instant()
): string {
  return formatElapsed(durationBetween(now, instant));
}

export function formatRelativeInstantOrNull(
  instant: Temporal.Instant | null,
  now: Temporal.Instant = Temporal.Now.instant()
): string | null {
  if (instant === null) return null;
  return formatElapsed(durationBetween(now, instant));
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

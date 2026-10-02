/**
 * Helpers for .NET `TimeSpan` strings — the format the API uses for durations
 * that aren't instants, e.g. an automation token's `autoCleanupAfter`.
 *
 * Wire format is `[-][d.]hh:mm:ss[.fffffff]`; the API's own schema pattern is
 * `^-?(\d+\.)?\d{2}:\d{2}:\d{2}(\.\d{1,7})?$`.
 */

const TIMESPAN_RE = /^(-)?(?:(\d+)\.)?(\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,7}))?$/;

const SECONDS_PER_MINUTE = 60;
const SECONDS_PER_HOUR = 60 * SECONDS_PER_MINUTE;
const SECONDS_PER_DAY = 24 * SECONDS_PER_HOUR;

/** Total seconds in a TimeSpan string, or null if it isn't one. Sub-second precision is dropped. */
export function parseTimeSpanSeconds(value: string): number | null {
  const match = TIMESPAN_RE.exec(value);
  if (!match) return null;

  const [, sign, days, hours, minutes, seconds] = match;
  const total =
    Number(days ?? 0) * SECONDS_PER_DAY +
    Number(hours) * SECONDS_PER_HOUR +
    Number(minutes) * SECONDS_PER_MINUTE +
    Number(seconds);

  return sign ? -total : total;
}

/** Serializes whole seconds as `[-][d.]hh:mm:ss`. */
export function timeSpanFromSeconds(totalSeconds: number): string {
  const abs = Math.abs(Math.trunc(totalSeconds));
  const days = Math.floor(abs / SECONDS_PER_DAY);
  const hours = Math.floor((abs % SECONDS_PER_DAY) / SECONDS_PER_HOUR);
  const minutes = Math.floor((abs % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE);
  const seconds = abs % SECONDS_PER_MINUTE;

  const pad = (n: number) => n.toString().padStart(2, '0');
  const clock = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;

  return `${totalSeconds < 0 ? '-' : ''}${days > 0 ? `${days}.` : ''}${clock}`;
}

const UNITS = [
  { label: 'day', seconds: SECONDS_PER_DAY },
  { label: 'hour', seconds: SECONDS_PER_HOUR },
  { label: 'minute', seconds: SECONDS_PER_MINUTE },
  { label: 'second', seconds: 1 },
] as const;

/**
 * The largest unit a duration divides into evenly — what a round value was most
 * likely entered as. The magnitude is returned unsigned.
 */
export function largestWholeUnit(totalSeconds: number): { value: number; unit: TimeSpanUnit } {
  const abs = Math.abs(totalSeconds);
  for (const { label, seconds } of UNITS) {
    if (abs >= seconds && abs % seconds === 0) {
      return { value: abs / seconds, unit: label };
    }
  }
  return { value: abs, unit: 'second' };
}

export type TimeSpanUnit = (typeof UNITS)[number]['label'];

export const timeSpanUnitSeconds: Record<TimeSpanUnit, number> = {
  day: SECONDS_PER_DAY,
  hour: SECONDS_PER_HOUR,
  minute: SECONDS_PER_MINUTE,
  second: 1,
};

/**
 * Human-readable label for a TimeSpan string — "7 days", "12 hours". Returns the
 * input unchanged if it isn't a TimeSpan, so an unexpected value is still shown
 * rather than swallowed.
 */
export function formatTimeSpan(value: string): string {
  const totalSeconds = parseTimeSpanSeconds(value);
  if (totalSeconds === null) return value;
  if (totalSeconds === 0) return 'immediately';

  const { value: count, unit } = largestWholeUnit(totalSeconds);
  const label = `${count} ${unit}${count === 1 ? '' : 's'}`;
  return totalSeconds < 0 ? `-${label}` : label;
}

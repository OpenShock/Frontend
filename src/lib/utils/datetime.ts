import { durationBetween, formatElapsed } from '@openshock/svelte-core/utils/index.js';

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

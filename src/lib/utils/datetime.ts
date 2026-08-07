import { durationBetween, formatElapsed } from '@openshock/svelte-core/utils/index.js';

/**
 * Relative label for an instant — "in 3 days", "2 hours ago".
 *
 * Returns `null` when the value is absent or is the epoch sentinel the API uses
 * for "this has never happened", so callers can pick their own wording.
 *
 * Pass `now` from reactive state to keep the label ticking; the default reads
 * the clock once and so is only correct at call time.
 */
export function formatRelativeInstant(
  instant: Temporal.Instant | null | undefined,
  now: Temporal.Instant = Temporal.Now.instant()
): string | null {
  if (!(instant instanceof Temporal.Instant) || instant.epochMilliseconds <= 0) return null;
  return formatElapsed(durationBetween(now, instant));
}

/**
 * A clock that re-reads itself on a timer, for relative labels ("2 hours ago")
 * that need to stay current without refetching the data behind them.
 *
 * Must be called at component initialisation time (top-level in a `<script>`
 * block) — it registers an `$effect`, which owns the interval and clears it when
 * the component is destroyed. The effect never runs during SSR, so the first
 * render uses the instant captured at init.
 *
 * Call `stop()` to clear the interval before then; the ticker is inert
 * afterwards and `current` holds its last value.
 *
 * @example
 *   const clock = createNowTicker();
 *
 *   {#each sessions as session (session.id)}
 *     {formatRelativeInstant(session.created, clock.current)}
 *   {/each}
 */
export function createNowTicker(intervalMs: number = 5000) {
  let current = $state(Temporal.Now.instant());
  let interval: ReturnType<typeof setInterval> | null = null;

  function stop() {
    if (interval === null) return;
    clearInterval(interval);
    interval = null;
  }

  $effect(() => {
    interval = setInterval(() => (current = Temporal.Now.instant()), intervalMs);
    return stop;
  });

  return {
    get current() {
      return current;
    },
    stop,
  };
}

export type NowTicker = ReturnType<typeof createNowTicker>;

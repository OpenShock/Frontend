import { onDestroy } from 'svelte';

export interface Debounced<Args extends unknown[]> {
  (...args: Args): void;
  cancel(): void;
  flush(): void;
}

export function debounce<Args extends unknown[]>(
  fn: (...args: Args) => void,
  delay: number
): Debounced<Args> {
  let handle: ReturnType<typeof setTimeout> | undefined;
  let pending: Args | undefined;

  const debounced = ((...args: Args) => {
    clearTimeout(handle);
    pending = args;
    handle = setTimeout(() => {
      handle = undefined;
      const p = pending;
      pending = undefined;
      if (p) fn(...p);
    }, delay);
  }) as Debounced<Args>;

  debounced.cancel = () => {
    clearTimeout(handle);
    handle = undefined;
    pending = undefined;
  };

  debounced.flush = () => {
    if (handle === undefined) return;
    clearTimeout(handle);
    handle = undefined;
    const p = pending;
    pending = undefined;
    if (p) fn(...p);
  };

  return debounced;
}

/** Component-aware `debounce` that cancels any pending invocation on unmount. */
export function useDebounce<Args extends unknown[]>(
  fn: (...args: Args) => void,
  delay: number
): Debounced<Args> {
  const d = debounce(fn, delay);
  onDestroy(d.cancel);
  return d;
}

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { debounce } from './debounce';

describe('debounce', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('delays invocation until the timer elapses', () => {
    const fn = vi.fn();
    const d = debounce(fn, 100);

    d('a');
    expect(fn).not.toHaveBeenCalled();
    vi.advanceTimersByTime(99);
    expect(fn).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(fn).toHaveBeenCalledExactlyOnceWith('a');
  });

  it('collapses rapid calls into one invocation with the latest args', () => {
    const fn = vi.fn();
    const d = debounce(fn, 100);

    d('a');
    vi.advanceTimersByTime(50);
    d('b');
    vi.advanceTimersByTime(50);
    d('c');
    vi.advanceTimersByTime(100);

    expect(fn).toHaveBeenCalledExactlyOnceWith('c');
  });

  it('cancel() drops the pending invocation', () => {
    const fn = vi.fn();
    const d = debounce(fn, 100);

    d('a');
    d.cancel();
    vi.advanceTimersByTime(200);

    expect(fn).not.toHaveBeenCalled();
  });

  it('flush() runs the pending invocation immediately', () => {
    const fn = vi.fn();
    const d = debounce(fn, 100);

    d('a');
    d.flush();
    expect(fn).toHaveBeenCalledExactlyOnceWith('a');

    vi.advanceTimersByTime(200);
    expect(fn).toHaveBeenCalledOnce();
  });

  it('flush() is a no-op when no call is pending', () => {
    const fn = vi.fn();
    const d = debounce(fn, 100);

    d.flush();
    expect(fn).not.toHaveBeenCalled();
  });
});

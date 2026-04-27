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

describe('debounce — edge cases', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('supports zero delay (still defers to next tick)', () => {
    const fn = vi.fn();
    const d = debounce(fn, 0);

    d('a');
    expect(fn).not.toHaveBeenCalled();
    vi.advanceTimersByTime(0);
    expect(fn).toHaveBeenCalledExactlyOnceWith('a');
  });

  it('cancel() before any call is a no-op', () => {
    const fn = vi.fn();
    const d = debounce(fn, 50);
    expect(() => d.cancel()).not.toThrow();
    expect(fn).not.toHaveBeenCalled();
  });

  it('cancel() after fire is a no-op and does not double-fire', () => {
    const fn = vi.fn();
    const d = debounce(fn, 50);

    d('a');
    vi.advanceTimersByTime(50);
    expect(fn).toHaveBeenCalledExactlyOnceWith('a');

    d.cancel();
    vi.advanceTimersByTime(500);
    expect(fn).toHaveBeenCalledOnce();
  });

  it('allows another call after a fire and re-debounces it', () => {
    const fn = vi.fn();
    const d = debounce(fn, 100);

    d('first');
    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledExactlyOnceWith('first');

    d('second');
    vi.advanceTimersByTime(99);
    expect(fn).toHaveBeenCalledOnce();
    vi.advanceTimersByTime(1);
    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn).toHaveBeenLastCalledWith('second');
  });

  it('flush() after fire does not invoke again', () => {
    const fn = vi.fn();
    const d = debounce(fn, 50);

    d('a');
    vi.advanceTimersByTime(50);
    expect(fn).toHaveBeenCalledOnce();

    d.flush();
    expect(fn).toHaveBeenCalledOnce();
  });

  it('passes through multiple arguments correctly', () => {
    const fn = vi.fn<(a: number, b: string, c: object) => void>();
    const d = debounce(fn, 10);

    const obj = { x: 1 };
    d(1, 'two', obj);
    vi.advanceTimersByTime(10);

    expect(fn).toHaveBeenCalledExactlyOnceWith(1, 'two', obj);
  });

  it('handles many rapid invocations with only the final one firing', () => {
    const fn = vi.fn();
    const d = debounce(fn, 25);

    for (let i = 0; i < 1000; i++) {
      d(i);
      vi.advanceTimersByTime(1);
    }
    vi.advanceTimersByTime(25);

    expect(fn).toHaveBeenCalledOnce();
    expect(fn).toHaveBeenCalledWith(999);
  });

  it('allows scheduling immediately after cancel()', () => {
    const fn = vi.fn();
    const d = debounce(fn, 30);

    d('a');
    vi.advanceTimersByTime(20);
    d.cancel();
    expect(fn).not.toHaveBeenCalled();

    d('b');
    vi.advanceTimersByTime(30);
    expect(fn).toHaveBeenCalledExactlyOnceWith('b');
  });

  it('flush() invokes synchronously without waiting for timer', () => {
    const fn = vi.fn();
    const d = debounce(fn, 10_000);

    d('immediate');
    d.flush();
    // No timer advance needed
    expect(fn).toHaveBeenCalledExactlyOnceWith('immediate');
  });
});

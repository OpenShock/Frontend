import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ControlType } from '$lib/signalr/models/ControlType';

vi.mock('$app/environment', () => ({ dev: false }));
vi.mock('svelte-sonner', () => ({ toast: { error: vi.fn() } }));

import {
  addShockEventListener,
  handleSignalrLog,
  removeShockEventListener,
} from './Log';
import { toast } from 'svelte-sonner';

const validSender = {
  connectionId: 'conn-1',
  additionalItems: {},
  id: 'user-1',
  name: 'Alice',
  image: 'avatar.png',
  customName: null,
};

function makeLog(overrides: Partial<ReturnType<typeof baseLog>> = {}) {
  return { ...baseLog(), ...overrides };
}

function baseLog() {
  return {
    shocker: { id: 'sh-1', name: 'Shocker One' },
    type: ControlType.Vibrate,
    intensity: 50,
    duration: 300,
    executedAt: new Date().toISOString(),
  };
}

beforeEach(() => {
  vi.mocked(toast.error).mockClear();
});

// Clean up any listeners added during tests to avoid cross-test contamination
// (Log.ts keeps a module-level listeners array)
const addedIds: string[] = [];
afterEach(() => {
  for (const id of addedIds) {
    removeShockEventListener(id);
  }
  addedIds.length = 0;
});

function trackListener(id: string, shockerId: string, cb: Parameters<typeof addShockEventListener>[2]) {
  addShockEventListener(id, shockerId, cb);
  addedIds.push(id);
}

describe('handleSignalrLog validation', () => {
  it('shows toast.error for invalid sender (null)', () => {
    handleSignalrLog(null, [makeLog()]);
    expect(vi.mocked(toast.error)).toHaveBeenCalled();
  });

  it('shows toast.error for invalid sender (missing fields)', () => {
    handleSignalrLog({ id: 'x' }, [makeLog()]);
    expect(vi.mocked(toast.error)).toHaveBeenCalled();
  });

  it('shows toast.error when logs is not an array', () => {
    handleSignalrLog(validSender, 'not-an-array');
    expect(vi.mocked(toast.error)).toHaveBeenCalled();
  });

  it('shows toast.error when logs array contains invalid entries', () => {
    handleSignalrLog(validSender, [{ type: 'bad' }]);
    expect(vi.mocked(toast.error)).toHaveBeenCalled();
  });

  it('accepts an empty logs array without error', () => {
    handleSignalrLog(validSender, []);
    expect(vi.mocked(toast.error)).not.toHaveBeenCalled();
  });
});

describe('handleSignalrLog dispatch', () => {
  it('calls a registered listener for a matching shocker', () => {
    const cb = vi.fn();
    trackListener('l-1', 'sh-1', cb);

    handleSignalrLog(validSender, [makeLog()]);

    expect(cb).toHaveBeenCalledOnce();
    expect(cb).toHaveBeenCalledWith('sh-1', ControlType.Vibrate, 300, 50);
  });

  it('does not call listener for a different shocker', () => {
    const cb = vi.fn();
    trackListener('l-2', 'sh-99', cb);

    handleSignalrLog(validSender, [makeLog()]);

    expect(cb).not.toHaveBeenCalled();
  });

  it('calls all matching listeners', () => {
    const cb1 = vi.fn();
    const cb2 = vi.fn();
    trackListener('l-3', 'sh-1', cb1);
    trackListener('l-4', 'sh-1', cb2);

    handleSignalrLog(validSender, [makeLog()]);

    expect(cb1).toHaveBeenCalledOnce();
    expect(cb2).toHaveBeenCalledOnce();
  });

  it('dispatches each log entry independently', () => {
    const cb = vi.fn();
    trackListener('l-5', 'sh-1', cb);

    const log1 = makeLog({ intensity: 30 });
    const log2 = makeLog({ intensity: 70 });
    handleSignalrLog(validSender, [log1, log2]);

    expect(cb).toHaveBeenCalledTimes(2);
  });
});

describe('addShockEventListener / removeShockEventListener', () => {
  it('listener is not called after removal', () => {
    const cb = vi.fn();
    addShockEventListener('l-remove', 'sh-1', cb);
    removeShockEventListener('l-remove');

    handleSignalrLog(validSender, [makeLog()]);
    expect(cb).not.toHaveBeenCalled();
  });

  it('removeShockEventListener is a no-op for unknown id', () => {
    expect(() => removeShockEventListener('does-not-exist')).not.toThrow();
  });
});

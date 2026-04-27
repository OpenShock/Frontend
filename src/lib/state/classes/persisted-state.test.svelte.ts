import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('$app/environment', () => ({ browser: true }));

const { PersistedState } = await import('./persisted-state.svelte');

class TrackingState<T> extends PersistedState<T> {
  changes: T[] = [];
  protected override onChange(value: T): void {
    this.changes.push(value);
  }
}

class StringState extends PersistedState<string> {
  protected override serialize(value: string): string {
    return value;
  }
  protected override deserialize(raw: string | null): string {
    if (raw === null) return this.defaultValue;
    return raw;
  }
}

class NumberState extends PersistedState<number> {
  protected override serialize(value: number): string {
    return String(value);
  }
  protected override deserialize(raw: string | null): number {
    if (raw === null) return this.defaultValue;
    return Number(raw);
  }
}

describe('PersistedState', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('default value', () => {
    it('returns the default when storage key is absent', () => {
      const state = new PersistedState('absent', 'default-value');
      expect(state.value).toBe('default-value');
      state.dispose();
    });

    it('exposes the default value via the defaultValue property', () => {
      const state = new PersistedState('absent2', 42);
      expect(state.defaultValue).toBe(42);
      state.dispose();
    });
  });

  describe('reading existing storage', () => {
    it('reads existing serialized value from localStorage', () => {
      localStorage.setItem('existing', JSON.stringify({ a: 1, b: 'two' }));
      const state = new PersistedState<{ a: number; b: string }>('existing', { a: 0, b: '' });
      expect(state.value).toEqual({ a: 1, b: 'two' });
      state.dispose();
    });

    it('reads existing serialized value from sessionStorage', () => {
      sessionStorage.setItem('session-existing', JSON.stringify(99));
      const state = new PersistedState<number>('session-existing', 0, { storage: 'session' });
      expect(state.value).toBe(99);
      state.dispose();
    });
  });

  describe('writing values', () => {
    it('persists to localStorage and updates the value getter', () => {
      const state = new PersistedState<number>('counter', 0);
      state.value = 5;
      expect(state.value).toBe(5);
      expect(localStorage.getItem('counter')).toBe(JSON.stringify(5));
      state.dispose();
    });

    it('persists to sessionStorage when configured', () => {
      const state = new PersistedState<string>('s-counter', 'a', { storage: 'session' });
      state.value = 'b';
      expect(state.value).toBe('b');
      expect(sessionStorage.getItem('s-counter')).toBe(JSON.stringify('b'));
      expect(localStorage.getItem('s-counter')).toBeNull();
      state.dispose();
    });

    it('serializes complex objects via JSON', () => {
      const state = new PersistedState<{ items: number[] }>('complex', { items: [] });
      state.value = { items: [1, 2, 3] };
      expect(localStorage.getItem('complex')).toBe(JSON.stringify({ items: [1, 2, 3] }));
      state.dispose();
    });
  });

  describe('reset()', () => {
    it('removes the storage entry and restores the default', () => {
      const state = new PersistedState<string>('to-reset', 'default');
      state.value = 'changed';
      expect(localStorage.getItem('to-reset')).not.toBeNull();

      state.reset();
      expect(state.value).toBe('default');
      expect(localStorage.getItem('to-reset')).toBeNull();
      state.dispose();
    });
  });

  describe('JSON parse error handling', () => {
    it('throws when stored value is not valid JSON', () => {
      localStorage.setItem('bad-json', 'not-json{');
      expect(() => new PersistedState('bad-json', 'default')).toThrow();
    });
  });

  describe('dispose()', () => {
    it('removes the storage event listener for localStorage', () => {
      const removeSpy = vi.spyOn(window, 'removeEventListener');
      const state = new PersistedState('dispose-test', 'x');
      state.dispose();
      expect(removeSpy).toHaveBeenCalledWith('storage', expect.any(Function));
    });

    it('does not error when called on a sessionStorage instance', () => {
      const state = new PersistedState('dispose-session', 'x', { storage: 'session' });
      expect(() => state.dispose()).not.toThrow();
    });

    it('stops receiving cross-tab updates after dispose()', () => {
      const state = new PersistedState<string>('after-dispose', 'init');
      state.dispose();

      window.dispatchEvent(
        new StorageEvent('storage', {
          key: 'after-dispose',
          newValue: JSON.stringify('updated'),
          storageArea: localStorage,
        })
      );

      expect(state.value).toBe('init');
    });
  });

  describe('cross-tab sync', () => {
    it('updates value when a matching storage event fires', () => {
      const state = new PersistedState<string>('sync-key', 'initial');

      window.dispatchEvent(
        new StorageEvent('storage', {
          key: 'sync-key',
          newValue: JSON.stringify('from-other-tab'),
          storageArea: localStorage,
        })
      );

      expect(state.value).toBe('from-other-tab');
      state.dispose();
    });

    it('falls back to default value when storage event has null newValue', () => {
      const state = new PersistedState<string>('sync-null', 'fallback');
      state.value = 'something';

      window.dispatchEvent(
        new StorageEvent('storage', {
          key: 'sync-null',
          newValue: null,
          storageArea: localStorage,
        })
      );

      expect(state.value).toBe('fallback');
      state.dispose();
    });

    it('does not update when key does not match', () => {
      const state = new PersistedState<string>('mine', 'initial');

      window.dispatchEvent(
        new StorageEvent('storage', {
          key: 'someone-elses',
          newValue: JSON.stringify('hijacked'),
          storageArea: localStorage,
        })
      );

      expect(state.value).toBe('initial');
      state.dispose();
    });

    it('does not update when storageArea does not match', () => {
      const state = new PersistedState<string>('area-key', 'initial');

      window.dispatchEvent(
        new StorageEvent('storage', {
          key: 'area-key',
          newValue: JSON.stringify('from-session'),
          storageArea: sessionStorage,
        })
      );

      expect(state.value).toBe('initial');
      state.dispose();
    });
  });

  describe('sessionStorage variant', () => {
    it('does not attach a storage event listener', () => {
      const addSpy = vi.spyOn(window, 'addEventListener');
      const state = new PersistedState('s-listener', 'x', { storage: 'session' });

      const storageCalls = addSpy.mock.calls.filter((call) => call[0] === 'storage');
      expect(storageCalls).toHaveLength(0);
      state.dispose();
    });

    it('ignores cross-tab storage events entirely', () => {
      const state = new PersistedState<string>('s-ignore', 'initial', { storage: 'session' });

      window.dispatchEvent(
        new StorageEvent('storage', {
          key: 's-ignore',
          newValue: JSON.stringify('changed'),
          storageArea: sessionStorage,
        })
      );

      expect(state.value).toBe('initial');
      state.dispose();
    });
  });

  describe('onChange hook', () => {
    it('fires when the setter is called', () => {
      const state = new TrackingState<number>('on-change-set', 0);
      state.value = 1;
      state.value = 2;
      expect(state.changes).toEqual([1, 2]);
      state.dispose();
    });

    it('fires when reset() is called', () => {
      const state = new TrackingState<string>('on-change-reset', 'default');
      state.value = 'changed';
      state.changes = [];
      state.reset();
      expect(state.changes).toEqual(['default']);
      state.dispose();
    });

    it('fires when a cross-tab storage event updates the value', () => {
      const state = new TrackingState<string>('on-change-storage', 'init');

      window.dispatchEvent(
        new StorageEvent('storage', {
          key: 'on-change-storage',
          newValue: JSON.stringify('remote'),
          storageArea: localStorage,
        })
      );

      expect(state.changes).toEqual(['remote']);
      state.dispose();
    });
  });

  describe('custom serialize/deserialize', () => {
    it('uses custom string serialization (no JSON quotes)', () => {
      const state = new StringState('plain-string', 'default');
      state.value = 'hello world';
      expect(localStorage.getItem('plain-string')).toBe('hello world');
      state.dispose();
    });

    it('reads pre-existing raw values via custom deserialize', () => {
      localStorage.setItem('plain-pre', 'raw-text');
      const state = new StringState('plain-pre', 'default');
      expect(state.value).toBe('raw-text');
      state.dispose();
    });

    it('round-trips a numeric value via String/Number serialization', () => {
      const state = new NumberState('plain-num', 0);
      state.value = 42;
      expect(localStorage.getItem('plain-num')).toBe('42');

      const reread = new NumberState('plain-num', 0);
      expect(reread.value).toBe(42);

      state.dispose();
      reread.dispose();
    });
  });

  describe('multiple instances', () => {
    it('different keys do not interfere', () => {
      const a = new PersistedState<number>('multi-a', 0);
      const b = new PersistedState<number>('multi-b', 0);

      a.value = 1;
      b.value = 2;

      expect(a.value).toBe(1);
      expect(b.value).toBe(2);
      expect(localStorage.getItem('multi-a')).toBe(JSON.stringify(1));
      expect(localStorage.getItem('multi-b')).toBe(JSON.stringify(2));

      a.dispose();
      b.dispose();
    });

    it('a storage event for one key does not affect another', () => {
      const a = new PersistedState<string>('iso-a', 'a-init');
      const b = new PersistedState<string>('iso-b', 'b-init');

      window.dispatchEvent(
        new StorageEvent('storage', {
          key: 'iso-a',
          newValue: JSON.stringify('a-changed'),
          storageArea: localStorage,
        })
      );

      expect(a.value).toBe('a-changed');
      expect(b.value).toBe('b-init');

      a.dispose();
      b.dispose();
    });
  });
});

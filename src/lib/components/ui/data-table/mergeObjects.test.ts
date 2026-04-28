import { describe, expect, it, vi } from 'vitest';
import { mergeObjects } from './data-table.svelte';

describe('mergeObjects', () => {
  it('returns the single source as a proxy', () => {
    const result = mergeObjects({ a: 1 });
    expect(result.a).toBe(1);
  });

  it('later sources override earlier ones for the same key', () => {
    const result = mergeObjects({ a: 1, b: 2 }, { a: 99 });
    expect(result.a).toBe(99);
    expect(result.b).toBe(2);
  });

  it('keys from all sources are accessible', () => {
    const result = mergeObjects({ x: 'hello' }, { y: 'world' });
    expect(result.x).toBe('hello');
    expect(result.y).toBe('world');
  });

  it('resolves thunk (function) sources lazily', () => {
    const thunk = vi.fn(() => ({ value: 42 }));
    const result = mergeObjects(thunk);
    expect(thunk).not.toHaveBeenCalled();
    expect(result.value).toBe(42);
    expect(thunk).toHaveBeenCalledOnce();
  });

  it('re-evaluates thunk on each property access', () => {
    let counter = 0;
    const thunk = () => ({ count: ++counter });
    const result = mergeObjects(thunk);
    void result.count;
    void result.count;
    expect(counter).toBe(2);
  });

  it('thunk returning null/undefined is skipped', () => {
    const result = mergeObjects(() => null as any, { fallback: true });
    expect(result.fallback).toBe(true);
  });

  it('"in" operator returns true for keys present in any source', () => {
    const result = mergeObjects({ a: 1 }, { b: 2 });
    expect('a' in result).toBe(true);
    expect('b' in result).toBe(true);
    expect('c' in result).toBe(false);
  });

  it('Object.keys covers keys from all sources', () => {
    const result = mergeObjects({ a: 1 }, { b: 2 }, { c: 3 });
    const keys = Object.keys(result).sort();
    expect(keys).toEqual(['a', 'b', 'c']);
  });

  it('handles empty sources gracefully', () => {
    const result = mergeObjects({}, {});
    expect(Object.keys(result)).toHaveLength(0);
  });

  it('merges more than two sources in priority order', () => {
    const result = mergeObjects({ a: 1 }, { a: 2 }, { a: 3 });
    expect(result.a).toBe(3); // last source wins
  });

  it('undefined property access returns undefined', () => {
    const result = mergeObjects({ a: 1 });
    expect((result as any).nonexistent).toBeUndefined();
  });
});

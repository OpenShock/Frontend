import { describe, expect, it } from 'vitest';
import { isTruthy } from './parse';

describe('isTruthy', () => {
  it.each([true, 1, '1', 'true', 'TRUE', 'True', 'yes', 'YES', 'y', 'Y', 'on', 'ON'])(
    'returns true for %j',
    (value) => {
      expect(isTruthy(value)).toBe(true);
    }
  );

  it.each([false, 0, 2, -1, '0', 'false', 'no', 'off', 'random', '', null, undefined])(
    'returns false for %j',
    (value) => {
      expect(isTruthy(value)).toBe(false);
    }
  );
});

describe('isTruthy edge cases', () => {
  it.each([NaN, Infinity, -Infinity, 1.0001, 0.9999, Number.MAX_SAFE_INTEGER, -0])(
    'returns false for non-1 numeric value %j',
    (value) => {
      expect(isTruthy(value)).toBe(false);
    }
  );

  it('treats numeric 1 (and not 1.0 with epsilon) strictly', () => {
    expect(isTruthy(1)).toBe(true);
    expect(isTruthy(1 + Number.EPSILON)).toBe(false);
  });

  it.each(['  true', 'true ', ' yes ', '\ttrue', 'true\n', '1 ', ' on'])(
    'rejects whitespace-padded truthy strings: %j',
    (value) => {
      expect(isTruthy(value)).toBe(false);
    }
  );

  it.each(['tRuE', 'YeS', 'On', 'oN', 'Y', 'y'])('accepts mixed-case truthy: %j', (value) => {
    expect(isTruthy(value)).toBe(true);
  });

  it.each(['truee', 'yess', 'yeah', 'enable', 'enabled', '11', '01'])(
    'rejects near-truthy strings: %j',
    (value) => {
      expect(isTruthy(value)).toBe(false);
    }
  );

  it('handles a very long non-truthy string', () => {
    expect(isTruthy('a'.repeat(10_000))).toBe(false);
  });

  it.each([{}, [], () => true, Symbol('x')])(
    'returns false for non-string/number/boolean type %#',
    (value) => {
      expect(isTruthy(value as unknown as string)).toBe(false);
    }
  );
});

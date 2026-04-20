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

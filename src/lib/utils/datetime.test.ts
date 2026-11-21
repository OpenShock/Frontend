import { describe, expect, it } from 'vitest';
import { formatClockDuration } from './datetime';

describe('formatClockDuration', () => {
  it('formats zero', () => {
    expect(formatClockDuration(0)).toBe('00:00:00');
  });

  it('drops sub-second precision', () => {
    expect(formatClockDuration(61999)).toBe('00:01:01');
  });

  it('carries into hours past 24', () => {
    expect(formatClockDuration(100 * 3600 * 1000 + 5000)).toBe('100:00:05');
  });
});

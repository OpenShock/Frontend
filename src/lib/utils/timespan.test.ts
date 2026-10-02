import { describe, expect, it } from 'vitest';
import {
  formatTimeSpan,
  largestWholeUnit,
  parseTimeSpanSeconds,
  timeSpanFromSeconds,
} from './timespan';

describe('parseTimeSpanSeconds', () => {
  it('parses a clock-only span', () => {
    expect(parseTimeSpanSeconds('01:02:03')).toBe(3723);
  });

  it('parses a span with a day component', () => {
    expect(parseTimeSpanSeconds('7.00:00:00')).toBe(604800);
  });

  it('parses multi-digit day counts', () => {
    expect(parseTimeSpanSeconds('365.00:00:00')).toBe(31536000);
  });

  it('drops sub-second precision', () => {
    expect(parseTimeSpanSeconds('00:00:01.5000000')).toBe(1);
  });

  it('parses a negative span', () => {
    expect(parseTimeSpanSeconds('-1.00:00:00')).toBe(-86400);
  });

  it('rejects a non-TimeSpan string', () => {
    expect(parseTimeSpanSeconds('P7D')).toBeNull();
  });

  it('rejects unpadded clock components', () => {
    expect(parseTimeSpanSeconds('1:02:03')).toBeNull();
  });
});

describe('timeSpanFromSeconds', () => {
  it('omits the day component below a day', () => {
    expect(timeSpanFromSeconds(3723)).toBe('01:02:03');
  });

  it('includes the day component', () => {
    expect(timeSpanFromSeconds(604800)).toBe('7.00:00:00');
  });

  it('round-trips through the parser', () => {
    expect(parseTimeSpanSeconds(timeSpanFromSeconds(123456))).toBe(123456);
  });

  it('serializes zero', () => {
    expect(timeSpanFromSeconds(0)).toBe('00:00:00');
  });

  it('signs a negative span', () => {
    expect(timeSpanFromSeconds(-86400)).toBe('-1.00:00:00');
  });
});

describe('largestWholeUnit', () => {
  it('prefers whole days', () => {
    expect(largestWholeUnit(604800)).toEqual({ value: 7, unit: 'day' });
  });

  it('falls back to hours when days do not divide evenly', () => {
    expect(largestWholeUnit(90000)).toEqual({ value: 25, unit: 'hour' });
  });

  it('falls back to seconds for an odd span', () => {
    expect(largestWholeUnit(61)).toEqual({ value: 61, unit: 'second' });
  });

  it('returns an unsigned magnitude', () => {
    expect(largestWholeUnit(-86400)).toEqual({ value: 1, unit: 'day' });
  });
});

describe('formatTimeSpan', () => {
  it('labels a whole number of days', () => {
    expect(formatTimeSpan('30.00:00:00')).toBe('30 days');
  });

  it('singularizes a single unit', () => {
    expect(formatTimeSpan('1.00:00:00')).toBe('1 day');
  });

  it('labels a sub-day span in hours', () => {
    expect(formatTimeSpan('12:00:00')).toBe('12 hours');
  });

  it('labels zero', () => {
    expect(formatTimeSpan('00:00:00')).toBe('immediately');
  });

  it('signs a negative span once', () => {
    expect(formatTimeSpan('-1.00:00:00')).toBe('-1 day');
  });

  it('passes an unparseable value through', () => {
    expect(formatTimeSpan('not-a-timespan')).toBe('not-a-timespan');
  });
});

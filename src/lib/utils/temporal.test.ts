import 'temporal-polyfill/global';
import { describe, expect, it } from 'vitest';
import { durationBetween, formatDuration, formatElapsed } from './temporal';

function instant(isoString: string): Temporal.Instant {
  return Temporal.Instant.from(isoString);
}

describe('durationBetween', () => {
  it('returns a positive duration when `to` is after `from`', () => {
    const from = instant('2024-01-01T00:00:00Z');
    const to = instant('2024-01-02T00:00:00Z');
    const d = durationBetween(from, to);
    expect(d.sign).toBe(1);
  });

  it('returns a negative duration when `to` is before `from`', () => {
    const from = instant('2024-01-02T00:00:00Z');
    const to = instant('2024-01-01T00:00:00Z');
    const d = durationBetween(from, to);
    expect(d.sign).toBe(-1);
  });

  it('returns zero duration for equal instants', () => {
    const from = instant('2024-06-15T12:00:00Z');
    const d = durationBetween(from, from);
    expect(d.sign).toBe(0);
  });

  it('captures years correctly', () => {
    const from = instant('2020-01-01T00:00:00Z');
    const to = instant('2024-01-01T00:00:00Z');
    const d = durationBetween(from, to);
    expect(d.years).toBe(4);
  });

  it('captures months correctly within a year', () => {
    const from = instant('2024-01-01T00:00:00Z');
    const to = instant('2024-06-01T00:00:00Z');
    const d = durationBetween(from, to);
    expect(d.years).toBe(0);
    expect(d.months).toBe(5);
  });
});

describe('formatDuration', () => {
  function dur(fields: Partial<Temporal.DurationLike>): Temporal.Duration {
    return Temporal.Duration.from(fields);
  }

  it('returns seconds for sub-minute durations', () => {
    expect(formatDuration(dur({ seconds: 1 }))).toBe('1 second');
    expect(formatDuration(dur({ seconds: 45 }))).toBe('45 seconds');
  });

  it('returns minutes when >= 1 minute', () => {
    expect(formatDuration(dur({ minutes: 1 }))).toBe('1 minute');
    expect(formatDuration(dur({ minutes: 30 }))).toBe('30 minutes');
  });

  it('returns hours when >= 1 hour', () => {
    expect(formatDuration(dur({ hours: 1 }))).toBe('1 hour');
    expect(formatDuration(dur({ hours: 3 }))).toBe('3 hours');
  });

  it('returns days when >= 1 day', () => {
    expect(formatDuration(dur({ days: 1 }))).toBe('1 day');
    expect(formatDuration(dur({ days: 6 }))).toBe('6 days');
  });

  it('returns months when >= 1 month', () => {
    expect(formatDuration(dur({ months: 1 }))).toBe('1 month');
    expect(formatDuration(dur({ months: 11 }))).toBe('11 months');
  });

  it('returns years when >= 1 year', () => {
    expect(formatDuration(dur({ years: 1 }))).toBe('1 year');
    expect(formatDuration(dur({ years: 5 }))).toBe('5 years');
  });

  it('uses the largest non-zero unit', () => {
    expect(formatDuration(dur({ years: 2, months: 3, days: 10 }))).toBe('2 years');
    expect(formatDuration(dur({ months: 0, days: 5, hours: 12 }))).toBe('5 days');
  });

  it('handles negative durations by using absolute values', () => {
    expect(formatDuration(dur({ years: -3 }))).toBe('3 years');
    expect(formatDuration(dur({ minutes: -15 }))).toBe('15 minutes');
  });

  it('uses singular for value of 1', () => {
    expect(formatDuration(dur({ seconds: 1 }))).toBe('1 second');
    expect(formatDuration(dur({ minutes: 1 }))).toBe('1 minute');
    expect(formatDuration(dur({ hours: 1 }))).toBe('1 hour');
    expect(formatDuration(dur({ days: 1 }))).toBe('1 day');
    expect(formatDuration(dur({ months: 1 }))).toBe('1 month');
    expect(formatDuration(dur({ years: 1 }))).toBe('1 year');
  });

  it('uses plural for values other than 1', () => {
    expect(formatDuration(dur({ seconds: 2 }))).toBe('2 seconds');
    expect(formatDuration(dur({ years: 10 }))).toBe('10 years');
  });
});

describe('formatElapsed', () => {
  function dur(fields: Partial<Temporal.DurationLike>): Temporal.Duration {
    return Temporal.Duration.from(fields);
  }

  it('prefixes "in " for future durations (positive sign)', () => {
    expect(formatElapsed(dur({ hours: 2 }))).toBe('in 2 hours');
    expect(formatElapsed(dur({ days: 1 }))).toBe('in 1 day');
  });

  it('suffixes " ago" for past durations (negative sign)', () => {
    expect(formatElapsed(dur({ hours: -2 }))).toBe('2 hours ago');
    expect(formatElapsed(dur({ days: -1 }))).toBe('1 day ago');
  });

  it('handles zero-length duration (sign === 0) as future', () => {
    expect(formatElapsed(Temporal.Duration.from({ seconds: 0 }))).toBe('in 0 seconds');
  });

  it('round-trips correctly with durationBetween for a 30-day gap', () => {
    const now = instant('2024-03-15T12:00:00Z');
    const future = instant('2024-04-14T12:00:00Z');
    const d = durationBetween(now, future);
    expect(formatElapsed(d)).toBe('in 30 days');
  });

  it('round-trips correctly with durationBetween for a past 2-year gap', () => {
    const now = instant('2024-06-01T00:00:00Z');
    const past = instant('2022-06-01T00:00:00Z');
    const d = durationBetween(now, past);
    expect(formatElapsed(d)).toBe('2 years ago');
  });
});

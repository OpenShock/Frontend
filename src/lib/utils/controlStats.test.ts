import type { ControlStatTotals } from '#lib/api/index.js';
import { describe, expect, it } from 'vitest';
import {
  dailySeries,
  formatStatDuration,
  summarizeByType,
  totalCount,
  totalDurationMs,
} from './controlStats';

function row(
  type: ControlStatTotals['type'],
  live: boolean,
  count: number,
  durationMs: number,
  averageIntensity: number,
  maxIntensity: number
): ControlStatTotals {
  return {
    type,
    live,
    count: BigInt(count),
    durationMs: BigInt(durationMs),
    averageIntensity,
    maxIntensity,
  };
}

describe('summarizeByType', () => {
  it('returns an empty summary for every charted type', () => {
    const summaries = summarizeByType([]);
    expect(summaries.map((s) => s.type)).toEqual(['Shock', 'Vibrate', 'Sound']);
    expect(summaries.every((s) => s.count === 0 && s.averageIntensity === 0)).toBe(true);
  });

  it('folds live and non-live rows and weights the average by duration', () => {
    const [shock] = summarizeByType([
      row('Shock', false, 3, 1000, 20, 40),
      row('Shock', true, 1, 3000, 60, 80),
    ]);
    expect(shock).toEqual({
      type: 'Shock',
      count: 4,
      durationMs: 4000,
      averageIntensity: 50,
      maxIntensity: 80,
      liveCount: 1,
      liveDurationMs: 3000,
    });
  });

  it('ignores Stop rows', () => {
    const summaries = summarizeByType([row('Stop', false, 5, 0, 0, 0)]);
    expect(summaries.every((s) => s.count === 0)).toBe(true);
  });
});

describe('totalCount and totalDurationMs', () => {
  it('sum every type except Stop', () => {
    const rows = [
      row('Shock', false, 2, 500, 10, 10),
      row('Vibrate', true, 3, 1500, 10, 10),
      row('Stop', false, 7, 0, 0, 0),
    ];
    expect(totalCount(rows)).toBe(5);
    expect(totalDurationMs(rows)).toBe(2000);
  });
});

describe('dailySeries', () => {
  it('fills days without activity with zeroes', () => {
    const from = Temporal.PlainDate.from('2026-10-01');
    const to = Temporal.PlainDate.from('2026-10-03');
    const series = dailySeries(
      [
        {
          date: Temporal.PlainDate.from('2026-10-02'),
          stats: [row('Shock', false, 2, 500, 10, 10), row('Shock', true, 1, 100, 10, 10)],
        },
      ],
      'count',
      from,
      to
    );
    expect(series).toEqual([
      { date: '2026-10-01', Shock: 0, Vibrate: 0, Sound: 0 },
      { date: '2026-10-02', Shock: 3, Vibrate: 0, Sound: 0 },
      { date: '2026-10-03', Shock: 0, Vibrate: 0, Sound: 0 },
    ]);
  });

  it('can chart duration instead of count', () => {
    const day = Temporal.PlainDate.from('2026-10-02');
    const series = dailySeries(
      [{ date: day, stats: [row('Sound', false, 2, 750, 10, 10)] }],
      'durationMs',
      day,
      day
    );
    expect(series[0].Sound).toBe(750);
  });
});

describe('formatStatDuration', () => {
  it.each([
    [4200, '4.2s'],
    [65_000, '1m 5s'],
    [8_040_000, '2h 14m'],
    [97_200_000, '1d 3h'],
  ])('formats %d ms as %s', (ms, expected) => {
    expect(formatStatDuration(ms)).toBe(expected);
  });
});

import { ControlType, type ControlStatTotals, type DailyControlStats } from '#lib/api/index.js';

/** Control types that carry activity worth charting, Stop is only ever a command. */
export const StatControlTypes = [
  ControlType.Shock,
  ControlType.Vibrate,
  ControlType.Sound,
] as const;
export type StatControlType = (typeof StatControlTypes)[number];

export interface ControlTypeSummary {
  type: StatControlType;
  count: number;
  durationMs: number;
  averageIntensity: number;
  maxIntensity: number;
  liveCount: number;
  liveDurationMs: number;
}

function emptySummary(type: StatControlType): ControlTypeSummary {
  return {
    type,
    count: 0,
    durationMs: 0,
    averageIntensity: 0,
    maxIntensity: 0,
    liveCount: 0,
    liveDurationMs: 0,
  };
}

function isStatControlType(type: ControlType): type is StatControlType {
  return (StatControlTypes as readonly ControlType[]).includes(type);
}

/**
 * Folds the live and non-live rows of each control type into one summary per type.
 * The average intensity stays weighted by duration, matching how the API computes it per row.
 */
export function summarizeByType(totals: ControlStatTotals[]): ControlTypeSummary[] {
  const summaries = new Map(StatControlTypes.map((type) => [type, emptySummary(type)]));
  const weightedIntensity = new Map<StatControlType, number>();

  for (const row of totals) {
    if (!isStatControlType(row.type)) continue;
    const summary = summaries.get(row.type)!;
    const count = Number(row.count);
    const durationMs = Number(row.durationMs);

    summary.count += count;
    summary.durationMs += durationMs;
    summary.maxIntensity = Math.max(summary.maxIntensity, row.maxIntensity);
    if (row.live) {
      summary.liveCount += count;
      summary.liveDurationMs += durationMs;
    }
    weightedIntensity.set(
      row.type,
      (weightedIntensity.get(row.type) ?? 0) + row.averageIntensity * durationMs
    );
  }

  for (const summary of summaries.values()) {
    if (summary.durationMs > 0) {
      summary.averageIntensity = weightedIntensity.get(summary.type)! / summary.durationMs;
    }
  }

  return [...summaries.values()];
}

/** Sum of counts across the given control types, Stop excluded. */
export function totalCount(totals: ControlStatTotals[]): number {
  return totals.reduce(
    (sum, row) => (isStatControlType(row.type) ? sum + Number(row.count) : sum),
    0
  );
}

/** Sum of durations across the given control types, Stop excluded. */
export function totalDurationMs(totals: ControlStatTotals[]): number {
  return totals.reduce(
    (sum, row) => (isStatControlType(row.type) ? sum + Number(row.durationMs) : sum),
    0
  );
}

export type DailyPoint = { date: string } & Record<StatControlType, number>;

/**
 * Turns the sparse daily breakdown into one point per day between `from` and `to`, both inclusive.
 * Days without activity are filled with zeroes so the chart keeps an even time axis.
 */
export function dailySeries(
  days: DailyControlStats[],
  metric: 'count' | 'durationMs',
  from: Temporal.PlainDate,
  to: Temporal.PlainDate
): DailyPoint[] {
  const byDate = new Map(days.map((day) => [day.date.toString(), day.stats]));
  const points: DailyPoint[] = [];

  for (let date = from; Temporal.PlainDate.compare(date, to) <= 0; date = date.add({ days: 1 })) {
    const point = { date: date.toString(), Shock: 0, Vibrate: 0, Sound: 0 };
    for (const row of byDate.get(date.toString()) ?? []) {
      if (!isStatControlType(row.type)) continue;
      point[row.type] += Number(metric === 'count' ? row.count : row.durationMs);
    }
    points.push(point);
  }

  return points;
}

/** Formats a duration in milliseconds as the two most significant units, e.g. `2h 14m` or `4.2s`. */
export function formatStatDuration(durationMs: number): string {
  const totalSeconds = durationMs / 1000;
  if (totalSeconds < 60) return `${Math.round(totalSeconds * 10) / 10}s`;

  const seconds = Math.floor(totalSeconds) % 60;
  const minutes = Math.floor(totalSeconds / 60) % 60;
  const hours = Math.floor(totalSeconds / 3600) % 24;
  const days = Math.floor(totalSeconds / 86400);

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m ${seconds}s`;
}

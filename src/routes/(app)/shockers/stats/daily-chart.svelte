<script lang="ts">
  import type { DailyControlStats } from '#lib/api/index.js';
  import { Button } from '@openshock/svelte-core/components/ui/button';
  import * as Card from '@openshock/svelte-core/components/ui/card';
  import * as Chart from '@openshock/svelte-core/components/ui/chart';
  import { scaleBand } from 'd3-scale';
  import { BarChart } from 'layerchart';
  import { m } from '#lib/paraglide/messages.js';
  import {
    StatControlTypes,
    dailySeries,
    durationAxisUnit,
    formatStatDuration,
  } from '#lib/utils/controlStats.js';
  import { controlTypeColors, controlTypeLabels } from './colors';

  interface Props {
    days: DailyControlStats[];
    from: Temporal.PlainDate;
    to: Temporal.PlainDate;
  }

  let { days, from, to }: Props = $props();

  let metric = $state<'count' | 'durationMs'>('count');

  let points = $derived(dailySeries(days, metric, from, to));
  let hasActivity = $derived(days.some((day) => day.stats.length > 0));

  // Durations are charted in whole seconds, minutes or hours so the axis ticks are round values.
  let unit = $derived(
    durationAxisUnit(Math.max(0, ...points.map((p) => p.Shock + p.Vibrate + p.Sound)))
  );
  let data = $derived(
    metric === 'count'
      ? points
      : points.map((p) => ({
          date: p.date,
          Shock: p.Shock / unit.ms,
          Vibrate: p.Vibrate / unit.ms,
          Sound: p.Sound / unit.ms,
        }))
  );

  const chartConfig: Chart.ChartConfig = Object.fromEntries(
    StatControlTypes.map((type) => [
      type,
      { label: controlTypeLabels[type](), theme: controlTypeColors[type] },
    ])
  );

  const series = StatControlTypes.map((type) => ({
    key: type,
    label: controlTypeLabels[type](),
    color: `var(--color-${type})`,
  }));

  // The year only matters on the axis once the range spans more than one.
  let spansYears = $derived(from.year !== to.year);

  const formatAxisDay = (date: string) =>
    Temporal.PlainDate.from(date).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      year: spansYears ? '2-digit' : undefined,
    });

  const formatTooltipDay = (date: string) =>
    Temporal.PlainDate.from(date).toLocaleString(undefined, { dateStyle: 'medium' });

  const formatTick = (value: number) =>
    metric === 'count' ? value.toLocaleString() : `${value.toLocaleString()}${unit.suffix}`;

  const formatValue = (value: number) =>
    metric === 'count' ? value.toLocaleString() : formatStatDuration(value * unit.ms);
</script>

<Card.Root class="min-w-0 gap-2 py-4">
  <Card.Header class="flex items-center justify-between gap-2 px-4">
    <Card.Title class="text-sm">{m.shocker_stats_daily_title()}</Card.Title>
    <div class="flex gap-1">
      <Button
        variant={metric === 'count' ? 'secondary' : 'ghost'}
        size="sm"
        class="h-7 text-xs"
        onclick={() => (metric = 'count')}>{m.shocker_stats_metric_count()}</Button
      >
      <Button
        variant={metric === 'durationMs' ? 'secondary' : 'ghost'}
        size="sm"
        class="h-7 text-xs"
        onclick={() => (metric = 'durationMs')}>{m.shocker_stats_metric_duration()}</Button
      >
    </div>
  </Card.Header>
  <Card.Content class="px-4">
    {#if !hasActivity}
      <p class="text-muted-foreground flex h-64 items-center justify-center text-sm">
        {m.shocker_stats_daily_empty()}
      </p>
    {:else}
      <Chart.Container config={chartConfig} class="aspect-auto h-64 w-full">
        <BarChart
          {data}
          x="date"
          xScale={scaleBand().padding(0.2)}
          {series}
          seriesLayout="stack"
          rule={false}
          legend
          padding={{ top: 4, right: 4, bottom: 52, left: 44 }}
          props={{
            bars: { stroke: 'none' },
            highlight: { area: { fill: 'none' } },
            // One band per day, so labels are thinned by their rendered width.
            xAxis: { format: formatAxisDay, tickOcclusion: { priority: 'start-end', padding: 8 } },
            yAxis: { format: formatTick },
          }}
        >
          {#snippet tooltip()}
            <Chart.Tooltip labelFormatter={formatTooltipDay}>
              {#snippet formatter({ value, item })}
                <div
                  class="size-2.5 shrink-0 rounded-[2px] bg-(--color-bg)"
                  style="--color-bg: {item.color}"
                ></div>
                <div class="flex flex-1 items-center justify-between gap-2 leading-none">
                  <span class="text-muted-foreground">{item.label}</span>
                  <span class="text-foreground font-mono font-medium tabular-nums">
                    {formatValue(Number(value))}
                  </span>
                </div>
              {/snippet}
            </Chart.Tooltip>
          {/snippet}
        </BarChart>
      </Chart.Container>
    {/if}
  </Card.Content>
</Card.Root>

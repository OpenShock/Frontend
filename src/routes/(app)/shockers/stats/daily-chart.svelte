<script lang="ts">
  import type { DailyControlStats } from '#lib/api/index.js';
  import { Button } from '@openshock/svelte-core/components/ui/button';
  import * as Card from '@openshock/svelte-core/components/ui/card';
  import * as Chart from '@openshock/svelte-core/components/ui/chart';
  import { scaleBand } from 'd3-scale';
  import { BarChart } from 'layerchart';
  import { StatControlTypes, dailySeries, formatStatDuration } from '#lib/utils/controlStats.js';
  import { controlTypeColors, controlTypeLabels } from './colors';

  interface Props {
    days: DailyControlStats[];
    from: Temporal.PlainDate;
    to: Temporal.PlainDate;
  }

  let { days, from, to }: Props = $props();

  let metric = $state<'count' | 'durationMs'>('count');

  let data = $derived(dailySeries(days, metric, from, to));

  const chartConfig: Chart.ChartConfig = Object.fromEntries(
    StatControlTypes.map((type) => [
      type,
      { label: controlTypeLabels[type], theme: controlTypeColors[type] },
    ])
  );

  const series = StatControlTypes.map((type) => ({
    key: type,
    label: controlTypeLabels[type],
    color: `var(--color-${type})`,
  }));

  const formatDay = (date: string) =>
    Temporal.PlainDate.from(date).toLocaleString(undefined, { month: 'short', day: 'numeric' });

  const formatValue = (value: number) =>
    metric === 'count' ? value.toLocaleString() : formatStatDuration(value);
</script>

<Card.Root class="min-w-0 gap-2 py-4">
  <Card.Header class="flex items-center justify-between gap-2 px-4">
    <Card.Title class="text-sm">Daily activity</Card.Title>
    <div class="flex gap-1">
      <Button
        variant={metric === 'count' ? 'secondary' : 'ghost'}
        size="sm"
        class="h-7 text-xs"
        onclick={() => (metric = 'count')}>Count</Button
      >
      <Button
        variant={metric === 'durationMs' ? 'secondary' : 'ghost'}
        size="sm"
        class="h-7 text-xs"
        onclick={() => (metric = 'durationMs')}>Duration</Button
      >
    </div>
  </Card.Header>
  <Card.Content class="px-4">
    <Chart.Container config={chartConfig} class="aspect-auto h-64 w-full">
      <BarChart
        {data}
        x="date"
        xScale={scaleBand().padding(0.2)}
        {series}
        seriesLayout="stack"
        rule={false}
        legend
        props={{
          bars: { stroke: 'none' },
          highlight: { area: { fill: 'none' } },
          xAxis: { format: formatDay },
          yAxis: { format: formatValue },
        }}
      >
        {#snippet tooltip()}
          <Chart.Tooltip labelFormatter={formatDay}>
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
  </Card.Content>
</Card.Root>

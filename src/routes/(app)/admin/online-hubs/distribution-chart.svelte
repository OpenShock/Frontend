<script lang="ts" module>
  export interface DistributionBucket {
    key: string | null;
    label: string;
    count: number;
  }

  const UNKNOWN = '\0';

  export function bucketize(
    values: (string | null)[],
    labelOf: (key: string | null) => string
  ): DistributionBucket[] {
    const counts: Record<string, number> = {};
    for (const value of values) {
      const key = value ?? UNKNOWN;
      counts[key] = (counts[key] ?? 0) + 1;
    }

    return Object.entries(counts)
      .map(([key, count]) => {
        const value = key === UNKNOWN ? null : key;
        return { key: value ?? '', label: labelOf(value), count };
      })
      .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
  }

  function fold(ranked: DistributionBucket[], limit: number): DistributionBucket[] {
    if (ranked.length <= limit) return ranked;
    const rest = ranked.slice(limit - 1);
    const other = rest.reduce((sum, b) => sum + b.count, 0);
    return [
      ...ranked.slice(0, limit - 1),
      { key: null, label: `Other (${rest.length})`, count: other },
    ];
  }
</script>

<script lang="ts">
  import { Button } from '@openshock/svelte-core/components/ui/button';
  import * as Card from '@openshock/svelte-core/components/ui/card';
  import * as Chart from '@openshock/svelte-core/components/ui/chart';
  import { scaleBand } from 'd3-scale';
  import { BarChart } from 'layerchart';
  import { cn } from '@openshock/svelte-core/utils';

  interface Props {
    title: string;
    buckets: DistributionBucket[];
    limit?: number;
    selected?: string | null;
    onSelect?: (key: string | null) => void;
  }

  let { title, buckets, limit = 8, selected = null, onSelect }: Props = $props();

  let expanded = $state(false);
  let canExpand = $derived(buckets.length > limit);
  let shown = $derived(expanded ? buckets : fold(buckets, limit));

  const ROW_HEIGHT = 32;
  const MAX_LABEL = 16;

  const chartConfig = {
    count: { label: 'Hubs', color: 'var(--primary)' },
  } satisfies Chart.ChartConfig;

  function barOpacity(bucket: DistributionBucket) {
    if (bucket.key === null) return 0.4;
    return selected === null || selected === bucket.key ? 1 : 0.25;
  }

  const truncate = (label: string) =>
    label.length > MAX_LABEL ? `${label.slice(0, MAX_LABEL - 1)}…` : label;
</script>

<Card.Root class="min-w-0 gap-2 py-4">
  <Card.Header class="flex items-center justify-between gap-2 px-4">
    <Card.Title class="text-sm">{title}</Card.Title>
    {#if canExpand}
      <Button
        variant="ghost"
        size="sm"
        class="text-muted-foreground -my-2 h-7 text-xs"
        onclick={() => (expanded = !expanded)}
      >
        {expanded ? 'Show less' : `Show all ${buckets.length}`}
      </Button>
    {/if}
  </Card.Header>
  <Card.Content class="px-4">
    {#if shown.length === 0}
      <p class="text-muted-foreground py-6 text-center text-sm">No hubs online</p>
    {:else}
      <div class="max-h-80 overflow-y-auto">
        <Chart.Container
          config={chartConfig}
          class={cn('aspect-auto w-full', onSelect && '[&_.lc-tooltip-rect]:cursor-pointer')}
          style="height: {shown.length * ROW_HEIGHT}px"
        >
          <BarChart
            data={shown}
            orientation="horizontal"
            y="label"
            x="count"
            yScale={scaleBand().padding(0.3)}
            series={[{ key: 'count', label: 'Hubs', color: chartConfig.count.color }]}
            axis="y"
            grid={false}
            rule={false}
            labels={{ offset: 6 }}
            padding={{ left: 112, right: 28 }}
            tooltipContext={{
              // The tooltip layer sits above the bars and swallows their clicks.
              onclick: (_, { data: bucket }) => {
                if (bucket.key === null || !onSelect) return;
                onSelect(selected === bucket.key ? null : bucket.key);
              },
            }}
            props={{
              bars: { stroke: 'none', radius: 4, rounded: 'edge', opacity: barOpacity },
              highlight: { area: { fill: 'none' } },
              yAxis: {
                format: (label: string) => truncate(label),
                tickLength: 0,
                tickLabelProps: { dx: -6 },
              },
            }}
          >
            {#snippet tooltip()}
              <Chart.Tooltip indicator="line" />
            {/snippet}
          </BarChart>
        </Chart.Container>
      </div>
    {/if}
  </Card.Content>
</Card.Root>

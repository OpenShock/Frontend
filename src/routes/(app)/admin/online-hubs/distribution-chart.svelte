<script lang="ts" module>
  export interface DistributionBucket {
    key: string | null;
    name: string;
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
        return { key: value ?? '', name: labelOf(value), count };
      })
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  }

  function fold(ranked: DistributionBucket[], limit: number): DistributionBucket[] {
    if (ranked.length <= limit) return ranked;
    const rest = ranked.slice(limit - 1);
    const other = rest.reduce((sum, b) => sum + b.count, 0);
    return [
      ...ranked.slice(0, limit - 1),
      { key: null, name: `Other (${rest.length})`, count: other },
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
    color: { light: string; dark: string };
    buckets: DistributionBucket[];
    limit?: number;
    selected?: string | null;
    onSelect?: (key: string | null) => void;
  }

  let { title, color, buckets, limit = 8, selected = null, onSelect }: Props = $props();

  let expanded = $state(false);
  let canExpand = $derived(buckets.length > limit);
  let shown = $derived(expanded ? buckets : fold(buckets, limit));

  const ROW_HEIGHT = 32;
  const MAX_LABEL = 24;

  // The stock tooltip titles itself with the x value, which is the count on a
  // horizontal chart; `labelKey="name"` makes it look the bucket name up here instead.
  let chartConfig = $derived<Chart.ChartConfig>({
    ...Object.fromEntries(shown.map((b) => [b.name, { label: b.name }])),
    count: { label: 'Hubs', theme: color },
  });

  function barOpacity(bucket: DistributionBucket) {
    if (selected !== null) return selected === bucket.key ? 1 : 0.25;
    return bucket.key === null ? 0.4 : 1;
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
            y="name"
            x="count"
            yScale={scaleBand().padding(0.3)}
            series={[{ key: 'count', label: 'Hubs', color: 'var(--color-count)' }]}
            axis="y"
            grid={false}
            rule={false}
            labels={{ offset: 6 }}
            padding={{ left: 160, right: 28 }}
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
              <Chart.Tooltip indicator="line" labelKey="name" />
            {/snippet}
          </BarChart>
        </Chart.Container>
      </div>
    {/if}
  </Card.Content>
</Card.Root>

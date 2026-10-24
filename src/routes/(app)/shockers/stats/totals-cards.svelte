<script lang="ts">
  import type { ControlStatTotals } from '#lib/api/index.js';
  import * as Card from '@openshock/svelte-core/components/ui/card';
  import { formatStatDuration, summarizeByType } from '#lib/utils/controlStats.js';
  import { controlTypeColors, controlTypeLabels } from './colors';

  interface Props {
    totals: ControlStatTotals[];
  }

  let { totals }: Props = $props();

  let summaries = $derived(summarizeByType(totals));

  const numberFormat = new Intl.NumberFormat();
</script>

<div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
  {#each summaries as summary (summary.type)}
    <Card.Root class="gap-2 py-4">
      <Card.Header class="flex items-center gap-2 px-4">
        <span
          class="size-2.5 rounded-full bg-(--light) dark:bg-(--dark)"
          style="--light: {controlTypeColors[summary.type].light}; --dark: {controlTypeColors[
            summary.type
          ].dark}"
        ></span>
        <Card.Title class="text-sm">{controlTypeLabels[summary.type]}</Card.Title>
      </Card.Header>
      <Card.Content class="flex flex-col gap-3 px-4">
        <div class="flex items-baseline gap-2">
          <span class="text-3xl font-semibold tabular-nums">
            {numberFormat.format(summary.count)}
          </span>
          <span class="text-muted-foreground text-sm">
            {formatStatDuration(summary.durationMs)}
          </span>
        </div>
        <dl class="text-muted-foreground grid grid-cols-3 gap-2 text-xs">
          <div>
            <dt>Avg intensity</dt>
            <dd class="text-foreground font-medium tabular-nums">
              {Math.round(summary.averageIntensity)}%
            </dd>
          </div>
          <div>
            <dt>Max intensity</dt>
            <dd class="text-foreground font-medium tabular-nums">{summary.maxIntensity}%</dd>
          </div>
          <div>
            <dt>Live</dt>
            <dd class="text-foreground font-medium tabular-nums">
              {numberFormat.format(summary.liveCount)}
            </dd>
          </div>
        </dl>
      </Card.Content>
    </Card.Root>
  {/each}
</div>

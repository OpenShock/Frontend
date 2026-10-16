<script lang="ts" module>
  import type { ControlStatTotals } from '#lib/api/index.js';

  export interface BreakdownRow {
    key: string;
    name: string;
    muted?: boolean;
    stats: ControlStatTotals[];
  }
</script>

<script lang="ts">
  import * as Card from '@openshock/svelte-core/components/ui/card';
  import * as Table from '@openshock/svelte-core/components/ui/table';
  import {
    StatControlTypes,
    formatStatDuration,
    summarizeByType,
    totalCount,
    totalDurationMs,
  } from '#lib/utils/controlStats.js';
  import { controlTypeLabels } from './colors';

  interface Props {
    title: string;
    nameHeader: string;
    rows: BreakdownRow[];
    emptyText: string;
  }

  let { title, nameHeader, rows, emptyText }: Props = $props();

  let summarized = $derived(
    rows
      .map((row) => {
        const byType = summarizeByType(row.stats);
        return {
          ...row,
          byType,
          total: totalCount(row.stats),
          durationMs: totalDurationMs(row.stats),
          maxIntensity: Math.max(0, ...byType.map((s) => s.maxIntensity)),
        };
      })
      .sort((a, b) => b.total - a.total || a.name.localeCompare(b.name))
  );

  const numberFormat = new Intl.NumberFormat();
</script>

<Card.Root class="min-w-0 gap-2 py-4">
  <Card.Header class="px-4">
    <Card.Title class="text-sm">{title}</Card.Title>
  </Card.Header>
  <Card.Content class="px-4">
    {#if summarized.length === 0}
      <p class="text-muted-foreground py-6 text-center text-sm">{emptyText}</p>
    {:else}
      <Table.Root>
        <Table.Header>
          <Table.Row>
            <Table.Head>{nameHeader}</Table.Head>
            {#each StatControlTypes as type (type)}
              <Table.Head class="text-right">{controlTypeLabels[type]}</Table.Head>
            {/each}
            <Table.Head class="text-right">Duration</Table.Head>
            <Table.Head class="text-right">Max intensity</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {#each summarized as row (row.key)}
            <Table.Row>
              <Table.Cell class={row.muted ? 'text-muted-foreground italic' : 'font-medium'}>
                {row.name}
              </Table.Cell>
              {#each row.byType as summary (summary.type)}
                <Table.Cell class="text-right tabular-nums">
                  {numberFormat.format(summary.count)}
                </Table.Cell>
              {/each}
              <Table.Cell class="text-right tabular-nums">
                {formatStatDuration(row.durationMs)}
              </Table.Cell>
              <Table.Cell class="text-right tabular-nums">{row.maxIntensity}%</Table.Cell>
            </Table.Row>
          {/each}
        </Table.Body>
      </Table.Root>
    {/if}
  </Card.Content>
</Card.Root>

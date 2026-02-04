<script lang="ts">
  import type { ColumnDef, SortingState } from '@tanstack/table-core';
  import type { LogEntryWithHub } from '$lib/api/internal/v1/index.js';
  import Container from '$lib/components/Container.svelte';
  import {
    CreateSortableColumnDef,
    LocaleDateTimeRenderer,
    NumberRenderer,
    RenderCell,
  } from '$lib/components/Table/ColumnUtils';
  import DataTable from '$lib/components/Table/DataTableTemplate.svelte';
  import * as Card from '$lib/components/ui/card';

  let { data } = $props();

  let sorting = $state<SortingState>([{ id: 'createdOn', desc: true }]);

  const columns: ColumnDef<LogEntryWithHub>[] = [
    CreateSortableColumnDef('hubName', 'Hub', (h) => RenderCell(h)),
    CreateSortableColumnDef('shockerName', 'Shocker', (s) => RenderCell(s)),
    CreateSortableColumnDef('createdOn', 'Time', LocaleDateTimeRenderer),
    CreateSortableColumnDef('type', 'Type', (t) => RenderCell(String(t))),
    CreateSortableColumnDef('controlledBy', 'By', (c) => RenderCell(c.customName ?? c.name)),
    CreateSortableColumnDef('intensity', 'Intensity', NumberRenderer),
    CreateSortableColumnDef('duration', 'Duration', NumberRenderer),
  ];
</script>

<Container>
  <Card.Header class="w-full">
    <Card.Title class="flex items-center justify-between space-x-2 text-3xl">
      <div class="flex items-center space-x-2">
        <span>Shocker Logs</span>
      </div>
    </Card.Title>
    <Card.Description>These are the logs for all shockers.</Card.Description>
  </Card.Header>
  <div class="grid w-full gap-6 p-6">
    <DataTable data={data.logs} {columns} bind:sorting />
  </div>
</Container>

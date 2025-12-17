<script lang="ts">
  import RotateCcw from '@lucide/svelte/icons/rotate-ccw';
  import type { ColumnDef, SortingState } from '@tanstack/table-core';
  import { page } from '$app/state';
  import type { LogEntry } from '$lib/api/internal/v1';
  import Container from '$lib/components/Container.svelte';
  import {
    CreateColumnDef,
    CreateSortableColumnDef,
    LocaleDateTimeRenderer,
    NumberRenderer,
    RenderCell,
  } from '$lib/components/Table/ColumnUtils';
  import DataTable from '$lib/components/Table/DataTableTemplate.svelte';
  import Button from '$lib/components/ui/button/button.svelte';
  import * as Card from '$lib/components/ui/card';
  import { ShockerLogStore, fetchLogsForShocker } from '$lib/stores/ShockerLogStore';
  import { onMount } from 'svelte';

  let data = $derived.by<LogEntry[]>(() => {
    const logMap = $ShockerLogStore;
    let allLogs: LogEntry[] = [];
    logMap.forEach((logs) => {
      allLogs = allLogs.concat(logs);
    });
    return allLogs;
  });

  let sorting = $state<SortingState>([{ id: 'createdOn', desc: true }]);

  const columns: ColumnDef<LogEntry>[] = [
    CreateSortableColumnDef('createdOn', 'Time', LocaleDateTimeRenderer),
    CreateSortableColumnDef('type', 'Type', (t) => RenderCell(String(t))),
    CreateSortableColumnDef('controlledBy', 'By', (c) => RenderCell(c.customName ?? c.name)),
    CreateSortableColumnDef('intensity', 'Intensity', NumberRenderer),
    CreateSortableColumnDef('duration', 'Duration', NumberRenderer),
  ];

  let shockerId = page.params.shockerId ?? '';

  function refresh() {
    if (!shockerId) return;
    fetchLogsForShocker(shockerId);
  }

  onMount(() => {
    if (shockerId) refresh();
  });
</script>

<Container>
  <Card.Header class="w-full">
    <Card.Title class="flex items-center justify-between space-x-2 text-3xl">
      <div class="flex items-center space-x-2">
        <span>Shocker Logs</span>
      </div>
      <div class="flex items-center justify-end space-x-2">
        <Button variant="ghost" aria-label="Refresh logs" onclick={refresh}>
          <RotateCcw />
        </Button>
      </div>
    </Card.Title>
    <Card.Description>These are the logs for the specified shocker.</Card.Description>
  </Card.Header>
  <div class="w-full p-6 gap-6 grid">
    <DataTable {data} {columns} bind:sorting />
  </div>
</Container>

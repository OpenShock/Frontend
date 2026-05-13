<script lang="ts">
  import type { ColumnDef, SortingState } from '@tanstack/table-core';
  import { shockersV1Api } from '$lib/api';
  import type { LogEntry, ShockerResponse } from '$lib/api/internal/v1';
  import Container from '$lib/components/Container.svelte';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
  import { page } from '$app/state';
  import { onMount } from 'svelte';
  import {
    CreateSortableColumnDef,
    LocaleDateTimeRenderer,
    NumberRenderer,
    RenderCell,
  } from '$lib/components/Table/ColumnUtils';
  import DataTable from '$lib/components/Table/DataTableTemplate.svelte';
  import * as Card from '$lib/components/ui/card';
  import { registerBreadcrumbs } from '$lib/state/breadcrumbs-state.svelte';

  registerBreadcrumbs(() => [
    { label: 'Shocker Logs', href: '/shockers/logs' },
    { label: 'Details' },
  ]);

  let logs = $state<LogEntry[]>([]);
  let shocker = $state<ShockerResponse | undefined>(undefined);
  let sorting = $state<SortingState>([{ id: 'createdOn', desc: true }]);

  onMount(async () => {
    const shockerId = page.params.shockerId;
    try {
      const [logsRes, shockerRes] = await Promise.all([
        shockersV1Api.shockerGetShockerLogs(shockerId),
        shockersV1Api.shockerGetShockerById(shockerId),
      ]);
      logs = logsRes.data ?? [];
      shocker = shockerRes.data;
    } catch (error) {
      await handleApiError(error);
    }
  });

  const columns: ColumnDef<LogEntry>[] = [
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
    <Card.Description>
      These are the logs for {shocker?.name}.
    </Card.Description>
  </Card.Header>
  <div class="grid w-full gap-6 p-6">
    <DataTable data={logs} {columns} bind:sorting />
  </div>
</Container>

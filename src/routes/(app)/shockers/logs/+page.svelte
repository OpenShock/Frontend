<script lang="ts">
  import { shockerGetAllShockerLogs } from '$lib/api';
  import type { ColumnDef, SortingState } from '@tanstack/table-core';
  import type { LogEntryWithHub } from '$lib/api';
  import Container from '$lib/components/Container.svelte';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
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
  import { addShockEventListener, removeShockEventListener } from '$lib/signalr/handlers/Log';
  import { ControlType } from '$lib/signalr/models/ControlType';
  import { ownHubs, refreshOwnHubs } from '$lib/state/hubs-state.svelte';

  registerBreadcrumbs(() => [{ label: 'Shocker Logs' }]);

  let logs = $state<LogEntryWithHub[]>([]);
  let sorting = $state<SortingState>([{ id: 'createdOn', desc: true }]);

  onMount(() => {
    const listenerId = crypto.randomUUID();

    (async () => {
      try {
        const [res] = await Promise.all([shockerGetAllShockerLogs(), refreshOwnHubs()]);
        logs = res.logs ?? [];
      } catch (error) {
        await handleApiError(error);
      }
    })();

    addShockEventListener(listenerId, null, (sender, log) => {
      let hubId = '';
      let hubName = '';
      for (const [id, hub] of ownHubs) {
        if (hub.shockers.some((s) => s.id === log.shocker.id)) {
          hubId = id;
          hubName = hub.name;
          break;
        }
      }

      const entry: LogEntryWithHub = {
        id: crypto.randomUUID(),
        hubId,
        hubName,
        shockerId: log.shocker.id,
        shockerName: log.shocker.name,
        createdOn: Temporal.Instant.from(log.executedAt),
        type: ControlType[log.type] as LogEntryWithHub['type'],
        controlledBy: {
          id: sender.id,
          name: sender.name,
          image: sender.image,
          customName: sender.customName,
        },
        intensity: log.intensity,
        duration: log.duration,
      };
      logs = [entry, ...logs];
    });

    return () => {
      removeShockEventListener(listenerId);
    };
  });

  const columns: ColumnDef<LogEntryWithHub>[] = [
    CreateSortableColumnDef('hubName', 'Hub', (h) => RenderCell(h)),
    CreateSortableColumnDef('shockerName', 'Shocker', (s) => RenderCell(s)),
    CreateSortableColumnDef('createdOn', 'Time', LocaleDateTimeRenderer, (a, b) =>
      Temporal.Instant.compare(a, b)
    ),
    CreateSortableColumnDef('type', 'Type', (t) => RenderCell(String(t))),
    CreateSortableColumnDef('controlledBy', 'By', (c) => RenderCell(c.customName ?? c.name)),
    CreateSortableColumnDef('intensity', 'Intensity', NumberRenderer),
    CreateSortableColumnDef('duration', 'Duration', NumberRenderer),
  ];
</script>

<Container>
  <Card.Header class="w-full">
    <Card.Title class="flex items-center justify-between space-x-2 text-3xl">
      <h1>Shocker Logs</h1>
    </Card.Title>
    <Card.Description>These are the logs for all shockers.</Card.Description>
  </Card.Header>
  <div class="grid w-full gap-6 p-6">
    <DataTable data={logs} {columns} bind:sorting />
  </div>
</Container>

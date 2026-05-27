<script lang="ts">
  import { shockerGetShockerById, shockerGetShockerLogs } from '$lib/api';
  import type { LogEntry, ShockerResponse } from '$lib/api';
  import type { ColumnDef, SortingState } from '@tanstack/table-core';
  import Container from '$lib/components/Container.svelte';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
  import { page } from '$app/state';
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

  registerBreadcrumbs(() => [
    { label: 'Shocker Logs', href: '/shockers/logs' },
    { label: 'Details' },
  ]);

  let logs = $state<LogEntry[]>([]);
  let shocker = $state<ShockerResponse | undefined>(undefined);
  let sorting = $state<SortingState>([{ id: 'createdOn', desc: true }]);

  $effect(() => {
    const shockerId = page.params.shockerId;
    if (!shockerId) return;

    let cancelled = false;
    logs = [];
    shocker = undefined;

    (async () => {
      try {
        const [logsRes, shockerRes] = await Promise.all([
          shockerGetShockerLogs({ path: { shockerId } }),
          shockerGetShockerById({ path: { shockerId } }),
        ]);
        if (cancelled) return;
        logs = logsRes.data ?? [];
        shocker = shockerRes.data;
      } catch (error) {
        if (cancelled) return;
        await handleApiError(error);
      }
    })();

    const listenerId = crypto.randomUUID();
    addShockEventListener(listenerId, shockerId, (sender, log) => {
      if (cancelled) return;
      const entry: LogEntry = {
        id: crypto.randomUUID(),
        createdOn: Temporal.Instant.from(log.executedAt),
        type: ControlType[log.type] as LogEntry['type'],
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
      cancelled = true;
      removeShockEventListener(listenerId);
    };
  });

  const columns: ColumnDef<LogEntry>[] = [
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

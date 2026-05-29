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
  import PaginationFooter from '$lib/components/Table/PaginationFooter.svelte';
  import * as Card from '$lib/components/ui/card';
  import { registerBreadcrumbs } from '$lib/state/breadcrumbs-state.svelte';
  import { addShockEventListener, removeShockEventListener } from '$lib/signalr/handlers/Log';
  import { ControlType } from '$lib/signalr/models/ControlType';
  import { ownHubs, refreshOwnHubs } from '$lib/state/hubs-state.svelte';


  registerBreadcrumbs(() => [
    { label: 'Shockers', href: '/shockers/own' },
    { label: 'Shocker Logs' },
  ]);
  
  const DEFAULT_SORT_ID = 'createdOn';

  let logs = $state<LogEntryWithHub[]>([]);
  let sorting = $state<SortingState>([{ id: DEFAULT_SORT_ID, desc: true }]);

  let isFetching = $state(false);
  let requestedPage = $state(1);
  let pageSize = $state(100);
  let page = $state(1);
  let total = $state(0);

  const sortQuery = $derived(sorting.length > 0 ? sorting[0] : undefined);
  // Live updates only make sense on page 1 with the default newest-first sort,
  // otherwise prepending breaks the user's chosen ordering / page slice.
  const liveUpdatesActive = $derived(
    page === 1 && (!sortQuery || (sortQuery.id === DEFAULT_SORT_ID && sortQuery.desc))
  );

  $effect(() => {
    const requested = requestedPage;
    const sort = sortQuery;
    const size = pageSize;

    isFetching = true;
    shockerGetAllShockerLogs({
      query: {
        page: requested,
        pageSize: size,
        sort: sort?.id,
        sortDir: sort ? (sort.desc ? 'Desc' : 'Asc') : undefined,
      },
    })
      .then((res) => {
        logs = res.items;
        page = res.page;
        pageSize = res.pageSize;
        total = res.totalCount;
      })
      .catch(handleApiError)
      .finally(() => (isFetching = false));
  });

  onMount(() => {
    const listenerId = crypto.randomUUID();

    refreshOwnHubs().catch(handleApiError);

    addShockEventListener(listenerId, null, (sender, log) => {
      if (!liveUpdatesActive) return;

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
      logs = [entry, ...logs.slice(0, pageSize - 1)];
      total += 1;
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
    <PaginationFooter
      count={total}
      perPage={pageSize}
      bind:page={() => page, (p) => (requestedPage = p)}
      disabled={isFetching}
    />
  </div>
</Container>
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
  import Button from '$lib/components/ui/button/button.svelte';
  import * as Card from '$lib/components/ui/card';
  import * as Select from '$lib/components/ui/select';
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

  // Empty = no filter (logs for all of the caller's shockers).
  let selectedShockerIds = $state<string[]>([]);

  const filterLabel = $derived.by(() => {
    if (selectedShockerIds.length === 0) return 'All shockers';
    if (selectedShockerIds.length === 1) {
      for (const hub of ownHubs.values()) {
        const shocker = hub.shockers.find((s) => s.id === selectedShockerIds[0]);
        if (shocker) return shocker.name;
      }
      return '1 shocker';
    }
    return `${selectedShockerIds.length} shockers`;
  });

  // Reset to the first page whenever the filter changes so we never land on an
  // out-of-range page for the narrowed result set.
  function onFilterChange() {
    requestedPage = 1;
  }

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
    const shockerIds = selectedShockerIds;

    isFetching = true;
    shockerGetAllShockerLogs({
      query: {
        page: requested,
        pageSize: size,
        sort: sort?.id,
        sortDir: sort ? (sort.desc ? 'Desc' : 'Asc') : undefined,
        shockerIds: shockerIds.length > 0 ? shockerIds : undefined,
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
      // Honour the active shocker filter for live entries too.
      if (selectedShockerIds.length > 0 && !selectedShockerIds.includes(log.shocker.id)) return;

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
    <div class="flex items-center gap-2">
      <Select.Root type="multiple" bind:value={selectedShockerIds} onValueChange={onFilterChange}>
        <Select.Trigger class="w-64">{filterLabel}</Select.Trigger>
        <Select.Content>
          {#each [...ownHubs.values()] as hub (hub.id)}
            {#if hub.shockers.length > 0}
              <Select.Group>
                <Select.GroupHeading>{hub.name}</Select.GroupHeading>
                {#each hub.shockers as shocker (shocker.id)}
                  <Select.Item value={shocker.id} label={shocker.name}>{shocker.name}</Select.Item>
                {/each}
              </Select.Group>
            {/if}
          {/each}
        </Select.Content>
      </Select.Root>
      {#if selectedShockerIds.length > 0}
        <Button
          variant="ghost"
          size="sm"
          onclick={() => {
            selectedShockerIds = [];
            onFilterChange();
          }}
        >
          Clear
        </Button>
      {/if}
    </div>
    <DataTable data={logs} {columns} bind:sorting />
    <PaginationFooter
      count={total}
      perPage={pageSize}
      bind:page={() => page, (p) => (requestedPage = p)}
      disabled={isFetching}
    />
  </div>
</Container>
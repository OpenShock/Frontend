<script lang="ts">
  import { shockerGetAllShockerLogs } from '$lib/api';
  import type { LogEntryWithHub } from '$lib/api';
  import { Container, EmptyState } from '@openshock/svelte-core/components';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
  import { onMount } from 'svelte';
  import PaginationFooter from '$lib/components/Table/PaginationFooter.svelte';
  import { Badge } from '@openshock/svelte-core/components/ui/badge';
  import { Button } from '@openshock/svelte-core/components/ui/button';
  import * as Select from '@openshock/svelte-core/components/ui/select';
  import { PageHeader } from '@openshock/svelte-core/components';
  import { formatDurationSeconds } from '@openshock/svelte-core/utils/index.js';
  import MultiSelectCombobox from '@openshock/svelte-core/components/multi-select-combobox/multi-select-combobox.svelte';
  import ArrowDown from '@lucide/svelte/icons/arrow-down';
  import ArrowUp from '@lucide/svelte/icons/arrow-up';
  import ScrollText from '@lucide/svelte/icons/scroll-text';
  import { registerBreadcrumbs } from '$lib/state/breadcrumbs-state.svelte';
  import { addShockEventListener, removeShockEventListener } from '$lib/signalr/handlers/Log';
  import { ControlType } from '$lib/signalr/models/ControlType';
  import { ownHubs, refreshOwnHubs } from '$lib/state/hubs-state.svelte';
  import { createUrlFilters } from '$lib/utils/urlFilters.svelte';

  registerBreadcrumbs(() => [
    { label: 'Shockers', href: '/shockers/own' },
    { label: 'Shocker Logs' },
  ]);

  const SORT_FIELDS = [
    { value: 'createdOn', label: 'Time' },
    { value: 'hubName', label: 'Hub' },
    { value: 'shockerName', label: 'Shocker' },
    { value: 'type', label: 'Type' },
    { value: 'controlledBy', label: 'By' },
    { value: 'intensity', label: 'Intensity' },
    { value: 'duration', label: 'Duration' },
  ] as const;

  type SortField = (typeof SORT_FIELDS)[number]['value'];

  const DEFAULT_SORT_FIELD: SortField = 'createdOn';

  let logs = $state<LogEntryWithHub[]>([]);
  let sortField = $state<SortField>(DEFAULT_SORT_FIELD);
  let sortDesc = $state(true);

  const sortLabel = $derived(SORT_FIELDS.find((f) => f.value === sortField)?.label ?? 'Time');

  let isFetching = $state(false);
  let requestedPage = $state(1);
  let page = $state(1);
  let total = $state(0);

  // Monotonic token so out-of-order responses are discarded: only the most
  // recently issued request is allowed to apply its result.
  let fetchToken = 0;

  // Row metrics — entries are fixed-height (two truncated lines), so we can
  // size pages off them without measuring each row.
  const ROW_HEIGHT = 53; // py-2 (16) + text-sm line (20) + text-xs line (16) + divider (1)
  // The pagination footer and the gap above it share the measured area with the
  // list, so subtract them when working out how many rows actually fit.
  const FOOTER_ALLOWANCE = 64; // pagination footer (~40) + gap-6 (24)
  const MIN_PAGE_SIZE = 10;
  const DEFAULT_PAGE_SIZE = 25; // used before the viewport has been measured

  // Height available to the list, measured from the DOM (see markup binding).
  // The raw value updates continuously while resizing; we debounce it into
  // `settledViewportHeight` so pageSize (and the fetch it drives) only reacts
  // once the resize settles, instead of firing a request per pixel.
  let listViewportHeight = $state(0);
  let settledViewportHeight = $state(0);

  $effect(() => {
    const height = listViewportHeight;
    if (settledViewportHeight === 0) {
      // Apply the first real measurement immediately so we don't sit on the
      // default page size for a debounce interval on initial load.
      settledViewportHeight = height;
      return;
    }
    const timeout = setTimeout(() => (settledViewportHeight = height), 150);
    return () => clearTimeout(timeout);
  });

  // Fit as many rows as the viewport allows (clamped to a sane minimum) so the
  // list fills the screen and we request exactly the page size we can show.
  const pageSize = $derived.by(() => {
    if (settledViewportHeight <= 0) return DEFAULT_PAGE_SIZE;
    const usable = settledViewportHeight - FOOTER_ALLOWANCE;
    const rows = Math.floor(usable / ROW_HEIGHT);
    return Math.max(MIN_PAGE_SIZE, rows);
  });

  // Shocker filter synced to the URL (comma-separated list under ?shockerId=)
  // so it can be bookmarked / shared. Empty = no filter (all of the caller's
  // shockers).
  const filters = createUrlFilters({
    shockerId: { type: 'string' },
  } as const);

  const shockerOptions = $derived(
    ownHubs
      .values()
      .flatMap((hub) => hub.shockers)
      .map((shocker) => ({ value: shocker.id, label: shocker.name }))
      .toArray()
  );

  // Local selection bound to the combobox, which mutates the array in place, so
  // it needs a real $state target (not a derived getter/setter). Seeded from the
  // URL-synced filter.
  let selectedShockerIds = $state<string[]>(
    filters.shockerId ? filters.shockerId.split(',').filter(Boolean) : []
  );

  // Push selection changes back into the URL-synced filter and reset to the
  // first page so we never land on an out-of-range page for the narrowed set.
  $effect(() => {
    const joined = selectedShockerIds.length > 0 ? selectedShockerIds.join(',') : undefined;
    if (joined !== filters.shockerId) {
      filters.shockerId = joined;
      requestedPage = 1;
    }
  });

  // Live updates only make sense on page 1 with the default newest-first sort,
  // otherwise prepending breaks the user's chosen ordering / page slice.
  const liveUpdatesActive = $derived(page === 1 && sortField === DEFAULT_SORT_FIELD && sortDesc);

  function controlledByName(entry: LogEntryWithHub): string {
    return entry.controlledBy.customName ?? entry.controlledBy.name;
  }

  $effect(() => {
    const requested = requestedPage;
    const field = sortField;
    const desc = sortDesc;
    const size = pageSize;
    const shockerIds = selectedShockerIds;

    const token = ++fetchToken;
    isFetching = true;
    shockerGetAllShockerLogs({
      query: {
        page: requested,
        pageSize: size,
        sort: field,
        sortDir: desc ? 'Desc' : 'Asc',
        shockerIds: shockerIds.length > 0 ? shockerIds : undefined,
      },
    })
      .then((res) => {
        // Discard responses superseded by a newer request.
        if (token !== fetchToken) return;
        logs = res.items;
        page = res.page;
        total = res.totalCount;
      })
      .catch((err) => {
        if (token !== fetchToken) return;
        handleApiError(err);
      })
      .finally(() => {
        if (token === fetchToken) isFetching = false;
      });
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
</script>

<Container>
  <PageHeader title="Shocker Logs" subtitle="These are the logs for all shockers.">
    <Badge
      variant={liveUpdatesActive ? 'default' : 'secondary'}
      class="gap-1.5"
      title={liveUpdatesActive
        ? 'New logs appear in real time'
        : 'Live updates pause when sorting or viewing a page other than the first'}
    >
      <span class="relative flex size-2">
        {#if liveUpdatesActive}
          <span
            class="absolute inline-flex size-full animate-ping rounded-full bg-green-400 opacity-75"
          ></span>
        {/if}
        <span
          class="relative inline-flex size-2 rounded-full {liveUpdatesActive
            ? 'bg-green-500'
            : 'bg-muted-foreground'}"
        ></span>
      </span>
      {liveUpdatesActive ? 'Live' : 'Paused'}
    </Badge>
  </PageHeader>
  <div class="flex min-h-0 w-full flex-1 flex-col gap-6">
    <div class="flex flex-wrap items-end gap-2">
      <div class="w-64">
        <MultiSelectCombobox
          bind:selected={selectedShockerIds}
          options={shockerOptions}
          label="Filter by shocker"
          placeholder="Search shockers..."
          selectText="All shockers"
          noMatchText="No matching shockers"
        />
      </div>
      {#if selectedShockerIds.length > 0}
        <Button variant="ghost" size="sm" onclick={() => (selectedShockerIds = [])}>Clear</Button>
      {/if}
      <div class="ml-auto flex items-end gap-2">
        <Select.Root
          type="single"
          value={sortField}
          onValueChange={(value) => (sortField = value as SortField)}
        >
          <Select.Trigger class="w-[150px]">Sort: {sortLabel}</Select.Trigger>
          <Select.Content>
            <Select.Group>
              <Select.Label>Sort by</Select.Label>
              {#each SORT_FIELDS as field (field.value)}
                <Select.Item value={field.value} label={field.label}>{field.label}</Select.Item>
              {/each}
            </Select.Group>
          </Select.Content>
        </Select.Root>
        <Button
          variant="outline"
          size="icon"
          onclick={() => (sortDesc = !sortDesc)}
          title="Sort {sortDesc ? 'descending' : 'ascending'}"
        >
          <span class="sr-only">Toggle sort direction</span>
          {#if sortDesc}
            <ArrowDown />
          {:else}
            <ArrowUp />
          {/if}
        </Button>
      </div>
    </div>
    <div class="flex min-h-0 flex-1 flex-col gap-6" bind:clientHeight={listViewportHeight}>
      {#if logs.length === 0}
        <EmptyState
          icon={ScrollText}
          title="No shocker logs"
          description={selectedShockerIds.length > 0
            ? 'No entries for the selected shockers yet.'
            : 'Control activity will show up here once a shocker is used.'}
        />
      {:else}
        <div class="min-h-0 flex-1 divide-y overflow-y-auto rounded-md border">
          {#each logs as entry (entry.id)}
            <div class="flex items-center gap-3 px-3 py-2">
              <Badge variant="secondary" class="shrink-0">{entry.type}</Badge>
              <div class="min-w-0 flex-1">
                <div class="truncate text-sm font-medium">{entry.shockerName}</div>
                <div class="text-muted-foreground truncate text-xs">
                  {entry.hubName} · by {controlledByName(entry)}
                </div>
              </div>
              <div class="shrink-0 text-right">
                <div class="text-sm">
                  {entry.intensity ? entry.intensity : 'N/A'} · {entry.duration
                    ? formatDurationSeconds(entry.duration / 1000)
                    : 'N/A'}
                </div>
                <div class="text-muted-foreground text-xs" title={entry.createdOn.toString()}>
                  {entry.createdOn.toLocaleString()}
                </div>
              </div>
            </div>
          {/each}
        </div>
      {/if}
      <PaginationFooter
        count={total}
        perPage={pageSize}
        bind:page={() => page, (p) => (requestedPage = p)}
        disabled={isFetching}
      />
    </div>
  </div>
</Container>

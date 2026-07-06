<script lang="ts" module>
  import type { ColumnDef } from '@tanstack/table-core';
  import {
    EmailStatus,
    type EmailOutboxMessageDto,
    type EmailStatus as EmailStatusType,
  } from '$lib/api';
  import {
    CellRedNone,
    CreateActionsColumnDef,
    CreateSortableColumnDef,
    LocaleDateTimeRenderer,
    RenderBlueCell,
    RenderBoldCell,
    RenderCell,
    RenderCellWithTooltip,
    RenderGreenCell,
    RenderOrangeCell,
    RenderRedCell,
  } from '$lib/components/Table/ColumnUtils';
  import DataTableActions from './data-table-actions.svelte';
  import { odataAnd, odataContains, odataEq } from '$lib/utils/odata';

  function StatusRenderer(status: EmailStatusType) {
    switch (status) {
      case EmailStatus.Sent:
        return RenderGreenCell(status);
      case EmailStatus.Failed:
        return RenderRedCell(status);
      case EmailStatus.Pending:
        return RenderOrangeCell(status);
      case EmailStatus.Sending:
        return RenderBlueCell(status);
      default:
        return RenderBoldCell(status);
    }
  }

  function LastErrorRenderer(error: string | null) {
    if (!error) return CellRedNone;
    const short = error.length > 60 ? error.slice(0, 57) + '…' : error;
    return RenderCellWithTooltip(short, error);
  }
</script>

<script lang="ts">
  import type { SortingState } from '@tanstack/table-core';
  import {
    adminGetEmailOutbox,
    adminGetEmailOutboxStats,
    type EmailOutboxMessageDtoPaginated,
    type EmailOutboxStatsDto,
  } from '$lib/api';
  import { Container } from '@openshock/svelte-core/components/index.js';
  import DataTable from '$lib/components/Table/DataTableTemplate.svelte';
  import PaginationFooter from '$lib/components/Table/PaginationFooter.svelte';
  import { Button } from '@openshock/svelte-core/components/ui/button/index.js';
  import { CardHeader, CardTitle } from '@openshock/svelte-core/components/ui/card/index.js';
  import { Input } from '@openshock/svelte-core/components/ui/input/index.js';
  import { RotateCcw, Send } from '@lucide/svelte';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
  import { registerBreadcrumbs } from '$lib/state/breadcrumbs-state.svelte';
  import { useDebounce } from '@openshock/svelte-core/utils/debounce.js';
  import SendTestDialog from './dialog-send-test.svelte';

  registerBreadcrumbs(() => [{ label: 'Mail' }]);

  const columns: ColumnDef<EmailOutboxMessageDto>[] = [
    CreateSortableColumnDef('type', 'Type', RenderCell),
    CreateSortableColumnDef('recipient', 'Recipient', RenderCell),
    CreateSortableColumnDef('status', 'Status', StatusRenderer),
    CreateSortableColumnDef('attemptCount', 'Attempts', (n) => RenderCell(n.toString())),
    CreateSortableColumnDef('createdAt', 'Created', LocaleDateTimeRenderer),
    CreateSortableColumnDef('nextAttemptAt', 'Next attempt', LocaleDateTimeRenderer),
    CreateSortableColumnDef('lastError', 'Last error', LastErrorRenderer),
    CreateActionsColumnDef(DataTableActions, (message) => ({
      message,
      onChanged: () => refresh(),
    })),
  ];

  const statusTiles: { status: EmailStatusType; label: string; color: string }[] = [
    { status: EmailStatus.Pending, label: 'Pending', color: 'text-orange-500' },
    { status: EmailStatus.Sending, label: 'Sending', color: 'text-blue-500' },
    { status: EmailStatus.Sent, label: 'Sent', color: 'text-green-500' },
    { status: EmailStatus.Failed, label: 'Failed', color: 'text-red-500' },
    { status: EmailStatus.Skipped, label: 'Skipped', color: 'text-muted-foreground' },
  ];

  let isFetching = $state(false);
  let refreshNonce = $state(0);
  let sendDialogOpen = $state(false);

  let requestedPage = $state(1);
  let requestedPageSize = $state(100);

  let page = $state(0);
  let perPage = $state(0);
  let total = $state(0);
  let data = $state<EmailOutboxMessageDto[]>([]);
  let stats = $state<EmailOutboxStatsDto | null>(null);

  let recipientSearch = $state('');
  let statusFilter = $state<EmailStatusType | null>(null);

  let sorting = $state<SortingState>([]);
  let filterQuery = $state<string | undefined>(undefined);
  let orderByQuery = $derived(
    sorting.length > 0 ? sorting[0].id + ' ' + (sorting[0].desc ? 'desc' : 'asc') : undefined
  );

  function refresh() {
    refreshNonce++;
  }

  function toggleStatus(status: EmailStatusType) {
    statusFilter = statusFilter === status ? null : status;
    requestedPage = 1;
  }

  function statusCount(status: EmailStatusType): number {
    if (!stats) return 0;
    switch (status) {
      case EmailStatus.Pending:
        return Number(stats.pending);
      case EmailStatus.Sending:
        return Number(stats.sending);
      case EmailStatus.Sent:
        return Number(stats.sent);
      case EmailStatus.Failed:
        return Number(stats.failed);
      default:
        return Number(stats.skipped);
    }
  }

  function handleResponse(response: EmailOutboxMessageDtoPaginated) {
    total = Number(response.total);
    data = response.data;
    perPage = response.limit;
    page = Math.floor(response.offset / response.limit) + 1;
  }

  const applyFilterQuery = useDebounce((query: string | undefined) => (filterQuery = query), 600);
  $effect(() => {
    const recipient = recipientSearch.trim();
    const query = odataAnd(
      recipient && odataContains('recipient', recipient),
      statusFilter && odataEq('status', statusFilter)
    );
    if (query === filterQuery) return;
    applyFilterQuery(query);
  });

  $effect(() => {
    void refreshNonce;
    const offset = (requestedPage - 1) * requestedPageSize;

    isFetching = true;
    adminGetEmailOutbox({
      query: {
        $filter: filterQuery,
        $orderby: orderByQuery,
        $offset: offset,
        $limit: requestedPageSize,
      },
    })
      .then(handleResponse)
      .catch(handleApiError)
      .finally(() => (isFetching = false));
  });

  $effect(() => {
    void refreshNonce;
    adminGetEmailOutboxStats()
      .then((s) => (stats = s))
      .catch(handleApiError);
  });
</script>

<SendTestDialog bind:open={sendDialogOpen} onSent={refresh} />

<Container>
  <CardHeader class="w-full">
    <CardTitle class="flex flex-wrap items-center justify-between gap-2 text-3xl">
      Mail queue
      <div class="flex items-center gap-2">
        <Input placeholder="Filter recipients..." bind:value={recipientSearch} class="max-w-xs" />
        <Button onclick={() => (sendDialogOpen = true)}>
          <Send class="size-4" />
          <span>Send test</span>
        </Button>
        <Button variant="outline" onclick={refresh}>
          <RotateCcw class="size-4" />
          <span>Refresh</span>
        </Button>
      </div>
    </CardTitle>
  </CardHeader>

  <div class="grid w-full gap-6 p-6">
    <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {#each statusTiles as tile (tile.status)}
        <button
          type="button"
          onclick={() => toggleStatus(tile.status)}
          class="bg-card hover:bg-accent flex flex-col items-start rounded-lg border p-4 text-left transition-colors {statusFilter ===
          tile.status
            ? 'ring-primary ring-2'
            : ''}"
        >
          <span class="text-muted-foreground text-sm">{tile.label}</span>
          <span class="text-2xl font-bold {tile.color}">{statusCount(tile.status)}</span>
        </button>
      {/each}
    </div>

    <DataTable
      {data}
      {columns}
      bind:sorting
      pagination={{ pageIndex: page - 1, pageSize: perPage }}
    />
    <PaginationFooter
      count={total}
      {perPage}
      bind:page={() => page, (p) => (requestedPage = p)}
      disabled={isFetching}
    />
  </div>
</Container>

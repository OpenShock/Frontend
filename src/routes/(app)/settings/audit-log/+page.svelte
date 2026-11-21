<script lang="ts" module>
  import type { AuditLogEntryResponse } from '#lib/api/index.js';
  import {
    CreateColumnDefs,
    LocaleDateTimeRenderer,
    RenderBoldCell,
    RenderCell,
    UserAgentRenderer,
  } from '#lib/components/Table/ColumnUtils.js';
  import { describeAction, describeMetadata } from './describe';
  import type { Features } from './data-table-features';

  const { CreateColumnDef, CreateSortableColumnDef } = CreateColumnDefs<
    Features,
    AuditLogEntryResponse
  >();

  const DEFAULT_SORT_ID = 'createdAt';

  const columns = [
    CreateSortableColumnDef('createdAt', m.audit_col_time(), LocaleDateTimeRenderer),
    CreateSortableColumnDef('action', m.audit_col_action(), (action) =>
      RenderBoldCell(describeAction(action))
    ),
    CreateColumnDef('metadata', m.audit_col_details(), (metadata) =>
      RenderCell(describeMetadata(metadata) ?? '')
    ),
    CreateColumnDef('reason', m.audit_col_reason(), (reason) => RenderCell(reason ?? '')),
    CreateColumnDef('ipAddress', m.audit_col_ip(), (ip) => RenderCell(ip ?? m.common_unknown())),
    CreateColumnDef('userAgent', m.audit_col_device(), UserAgentRenderer),
  ];
</script>

<script lang="ts">
  import { m } from '#lib/paraglide/messages.js';
  import { authenticatedAccountGetAuditLog } from '#lib/api/index.js';
  import DataTable from '#lib/components/Table/DataTableTemplate.svelte';
  import PaginationFooter from '#lib/components/Table/PaginationFooter.svelte';
  import { handleApiError } from '#lib/errorhandling/apiErrorHandling.js';
  import { registerBreadcrumbs } from '#lib/state/breadcrumbs-state.svelte.js';
  import { Container, PageHeader } from '@openshock/svelte-core/components';
  import { Input } from '@openshock/svelte-core/components/ui/input';
  import { useDebounce } from '@openshock/svelte-core/utils';
  import type { SortingState } from '@tanstack/svelte-table';
  import { features } from './data-table-features';

  registerBreadcrumbs(() => [
    { label: m.sidebar_group_settings(), href: 'settings/account' },
    { label: m.sidebar_settings_audit_log() },
  ]);

  const pageSize = 50;

  let isFetching = $state(false);
  let fetchToken = 0;

  let requestedPage = $state(1);
  let page = $state(1);
  let total = $state(0);
  let data = $state<AuditLogEntryResponse[]>([]);

  let sorting = $state<SortingState>([{ id: DEFAULT_SORT_ID, desc: true }]);
  const sortQuery = $derived(sorting.length > 0 ? sorting[0] : undefined);

  let searchInput = $state('');
  let search = $state<string>();
  const applySearch = useDebounce((query: string | undefined) => {
    search = query;
    requestedPage = 1;
  }, 500);
  $effect(() => {
    const query = searchInput.trim() || undefined;
    if (query === search) return;

    applySearch(query);
  });

  $effect(() => {
    const requested = requestedPage;
    const sort = sortQuery;
    const query = search;

    const token = ++fetchToken;
    isFetching = true;
    authenticatedAccountGetAuditLog({
      query: {
        page: requested,
        pageSize,
        search: query,
        sort: sort?.id,
        sortDir: sort ? (sort.desc ? 'Desc' : 'Asc') : undefined,
      },
    })
      .then((res) => {
        // Discard responses superseded by a newer request.
        if (token !== fetchToken) return;
        data = res.items;
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
</script>

<Container>
  <PageHeader title={m.sidebar_settings_audit_log()} subtitle={m.audit_subtitle()}>
    <Input
      placeholder={m.common_search_placeholder()}
      bind:value={searchInput}
      class="w-full sm:w-48"
    />
  </PageHeader>
  <div class="flex min-h-0 w-full min-w-0 flex-1 flex-col gap-6">
    <DataTable {data} {columns} {features} bind:sorting manualSorting />
    <PaginationFooter
      count={total}
      perPage={pageSize}
      bind:page={() => page, (p) => (requestedPage = p)}
      disabled={isFetching}
    />
  </div>
</Container>

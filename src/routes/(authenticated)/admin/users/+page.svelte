<script lang="ts">
  import type { SortingState } from '@tanstack/table-core';
  import { adminApi } from '$lib/api';
  import type { AdminUsersView, AdminUsersViewPaginated } from '$lib/api/internal/v1';
  import Container from '$lib/components/Container.svelte';
  import DataTable from '$lib/components/Table/DataTableTemplate.svelte';
  import PaginationFooter from '$lib/components/Table/PaginationFooter.svelte';
  import { CardHeader, CardTitle } from '$lib/components/ui/card';
  import { Input } from '$lib/components/ui/input';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
  import type { TimeoutHandle } from '$lib/types/WAPI';
  import { columns } from './columns';

  let isFetching = $state(false);

  let requestedPage = $state(1);
  let requestedPageSize = $state(10);

  let page = $state(0);
  let perPage = $state(0);
  let total = $state(0);
  let data = $state<AdminUsersView[]>([]);

  let nameSearch = $state('');
  let emailSearch = $state('');

  let sorting = $state<SortingState>([]);

  let filterQuery = $state<string>();
  let orderByQuery = $derived(
    sorting.length > 0 ? sorting[0].id + ' ' + (sorting[0].desc ? 'desc' : 'asc') : undefined
  );

  function escapeQuotes(str: string) {
    if (/[ '"\\]/.test(str)) {
      const escaped = str.replace(/(['"\\])/g, '\\$1');
      return `'${escaped}'`;
    }
    return str;
  }

  /**
   * Build a single filter clause for `key` and `searchString`.
   * - If there is any unescaped `%`, uses `ilike`.
   * - Otherwise uses `eq`.
   */
  function createSearchQuery(key: string, searchString: string): string | undefined {
    if (!searchString) return undefined;

    // Detect any % not preceded by a backslash
    const hasWildcard = /(^|[^\\])%/.test(searchString);

    // Wrap & escape quotes/backslashes as before
    const escaped = escapeQuotes(searchString);

    const operator = hasWildcard ? 'ilike' : 'eq';
    return `${key} ${operator} ${escaped}`;
  }

  function handleResponse(response: AdminUsersViewPaginated) {
    total = response.total;
    data = response.data;
    perPage = response.limit;
    if (page !== requestedPage) {
      console.warn('Page response mismatch!');
    }
    page = Math.floor(response.offset / response.limit) + 1;
  }

  let searchDebounce: TimeoutHandle | undefined;
  $effect(() => {
    clearTimeout(searchDebounce);

    const queries: string[] = [];

    const nameQ = createSearchQuery('name', nameSearch);
    if (nameQ) queries.push(nameQ);

    const emailQ = createSearchQuery('email', emailSearch);
    if (emailQ) queries.push(emailQ);

    const query = queries.length > 0 ? queries.join(' and ') : undefined;
    if (query === filterQuery) return;

    searchDebounce = setTimeout(() => (filterQuery = query), 800);
  });

  $effect(() => {
    const offset = (requestedPage - 1) * requestedPageSize;

    isFetching = true;
    adminApi
      .adminGetUsers(filterQuery, orderByQuery, offset, requestedPageSize)
      .then(handleResponse)
      .catch(handleApiError)
      .finally(() => (isFetching = false));
  });
</script>

<Container>
  <CardHeader class="w-full">
    <CardTitle class="flex items-center justify-between space-x-2 text-3xl">
      Users
      <div class="flex items-center justify-end space-x-2">
        <Input placeholder="Filter names..." bind:value={nameSearch} class="max-w-sm" />
        <Input placeholder="Filter emails..." bind:value={emailSearch} class="max-w-sm" />
      </div>
    </CardTitle>
  </CardHeader>
  <div class="w-full p-6 gap-6 grid">
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

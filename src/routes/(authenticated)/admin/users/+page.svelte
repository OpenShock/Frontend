<script lang="ts">
  import Search from '@lucide/svelte/icons/search';
  import type { ColumnFiltersState, PaginationState, SortingState } from '@tanstack/table-core';
  import { adminApi } from '$lib/api';
  import type { AdminUsersView } from '$lib/api/internal/v1/models/AdminUsersView';
  import DataTable from '$lib/components/Table/DataTableTemplate.svelte';
  import { Button } from '$lib/components/ui/button';
  import { CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { Input } from '$lib/components/ui/input';
  import * as Pagination from '$lib/components/ui/pagination';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
  import { onDestroy, onMount } from 'svelte';
  import { columns } from './columns';

  type FilterOpType =
    | 'like'
    | '=='
    | 'eq'
    | '!='
    | 'neq'
    | '<'
    | 'lt'
    | '>'
    | 'gt'
    | '<='
    | 'lte'
    | '>='
    | 'gte';
  type Filter<TEntity> = `${Extract<keyof TEntity, string>} ${FilterOpType} ${string}`;
  type FilterMap<TEntity> = { [K in keyof TEntity]: string };
  type OrderbyQuery<TEntity> = `${Extract<keyof TEntity, string>} ${'asc' | 'desc'}`;

  const PerPage = 200;

  let page = $state(1);
  let total = $state(0);
  let nameSearch = $state('');
  let emailSearch = $state('');

  let data = $state<AdminUsersView[]>([]);

  let pagination = $state<PaginationState>({ pageIndex: 0, pageSize: PerPage });
  let sorting = $state<SortingState>([]);
  let filters = $derived<ColumnFiltersState>([
    { id: 'name', value: nameSearch },
    { id: 'email', value: emailSearch },
  ]);

  function fetchUsers() {
    adminApi
      .adminGetUsers() /* filter, orderby, offset, limit */
      .then((res) => {
        if (res.data) {
          data = res.data;
        }
      })
      .catch(handleApiError);
  }

  let interval: ReturnType<typeof setInterval>;
  onMount(() => {
    fetchUsers();
    // Update timestamps every minute
    interval = setInterval(() => {
      data = Object.assign([], data);
    }, 60000);
  });
  onDestroy(() => {
    clearInterval(interval);
  });
</script>

<div class="container my-8">
  <CardHeader>
    <CardTitle class="flex items-center justify-between space-x-2 text-3xl">
      Users
      <div class="flex items-center justify-end space-x-2">
        <Input placeholder="Filter names..." bind:value={nameSearch} class="max-w-sm" />
        <Input placeholder="Filter emails..." bind:value={emailSearch} class="max-w-sm" />
        <Button class="btn variant-filled-primary text-xl" onclick={fetchUsers}>
          <Search />
          <span> Search </span>
        </Button>
      </div>
    </CardTitle>
  </CardHeader>
  <CardContent>
    <DataTable {data} {columns} {sorting} {filters} {pagination} />
  </CardContent>
  <Pagination.Root count={total} perPage={PerPage} bind:page>
    {#snippet children({ pages, currentPage })}
      <Pagination.Content>
        <Pagination.Item>
          <Pagination.PrevButton />
        </Pagination.Item>
        {#each pages as page (page.key)}
          {#if page.type === 'ellipsis'}
            <Pagination.Item>
              <Pagination.Ellipsis />
            </Pagination.Item>
          {:else}
            <Pagination.Item>
              <Pagination.Link {page} isActive={currentPage === page.value}>
                {page.value}
              </Pagination.Link>
            </Pagination.Item>
          {/if}
        {/each}
        <Pagination.Item>
          <Pagination.NextButton />
        </Pagination.Item>
      </Pagination.Content>
    {/snippet}
  </Pagination.Root>
</div>

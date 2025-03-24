<script lang="ts">
  import {
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    type ColumnFiltersState,
    type PaginationState,
    type SortingState,
  } from '@tanstack/table-core';
  import { adminApi } from '$lib/api';
  import type { AdminUsersView } from '$lib/api/internal/v1/models/AdminUsersView';
  import { Button } from '$lib/components/ui/button';
  import {
    CardHeader,
    CardTitle,
    CardContent
  } from '$lib/components/ui/card';
  import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNextButton,
    PaginationPrevButton,
  } from '$lib/components/ui/pagination';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
  import Table from '$lib/components/Table/TableTemplate.svelte';
  import { Input } from '$lib/components/ui/input';
  import { createSvelteTable } from '$lib/components/ui/data-table';
  import { columns, type User } from './columns';

  import RotateCcw from '@lucide/svelte/icons/rotate-ccw';

  function apiUserToTableDevice(user: AdminUsersView): User {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      password_hash_type: user.passwordHashType,
      created_at: user.createdAt,
      email_activated: user.emailActivated,
      roles: user.roles,
    };
  }

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

  let total = $state(0);
  let data = $state<User[]>([]);

  let page = $state(1);

  let nameFilterValue = $state('');
  let emailFilterValue = $state('');

  function fetchUsers($filter: string, $orderby: string, $page: number) {
    adminApi
      .adminGetUsers($filter, $orderby, ($page - 1) * PerPage, PerPage) /* filter, orderby, offset, limit */
      .then((res) => {
        if (res.data) {
          total = res.total;
          data = res.data.map(apiUserToTableDevice);
        }
      })
      .catch(handleApiError);
  }

  $effect(() => fetchUsers('', 'name asc', page));

  let pagination = $state<PaginationState>({ pageIndex: 0, pageSize: PerPage });
  let sorting = $state<SortingState>([]);
  let columnFilters = $state<ColumnFiltersState>([]);

  const table = createSvelteTable({
    get data() {
      return data;
    },
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onPaginationChange: (updater) => {
      if (typeof updater === 'function') {
        pagination = updater(pagination);
      } else {
        pagination = updater;
      }
    },
    onSortingChange: (updater) => {
      if (typeof updater === 'function') {
        sorting = updater(sorting);
      } else {
        sorting = updater;
      }
    },
    onColumnFiltersChange: (updater) => {
      if (typeof updater === 'function') {
        columnFilters = updater(columnFilters);
      } else {
        columnFilters = updater;
      }
    },
    state: {
      get pagination() {
        return pagination;
      },
      get sorting() {
        return sorting;
      },
      get columnFilters() {
        return columnFilters;
      },
    },
  });
</script>

<div class="container my-8">
  <CardHeader>
    <CardTitle class="flex items-center justify-between space-x-2 text-3xl">
      Users
    </CardTitle>
  </CardHeader>
  <CardContent>
    <div class="flex items-center space-x-4 py-4">
      <Input
        placeholder="Filter names..."
        bind:value={nameFilterValue}
        class="max-w-sm"
      />
      <Input
        placeholder="Filter emails..."
        bind:value={emailFilterValue}
        class="max-w-sm"
      />
      <div class="flex-1"></div>
      <Button class="btn variant-filled-primary text-xl" onclick={fetchUsers}>
        <RotateCcw />
        <span> Refresh </span>
      </Button>
    </div>
    <Table {table} {columns} />
  </CardContent>
  <Pagination count={total} perPage={PerPage} bind:page>
    {#snippet children({ pages, currentPage })}
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevButton />
        </PaginationItem>
        {#each pages as page (page.key)}
          {#if page.type === 'ellipsis'}
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
          {:else}
            <PaginationItem>
              <PaginationLink {page} isActive={currentPage === page.value}>
                {page.value}
              </PaginationLink>
            </PaginationItem>
          {/if}
        {/each}
        <PaginationItem>
          <PaginationNextButton />
        </PaginationItem>
      </PaginationContent>
    {/snippet}
  </Pagination>
</div>

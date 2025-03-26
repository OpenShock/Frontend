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
  import { onMount } from 'svelte';

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

  let page = $state(1);
  let filter = $state('');
  let orderby = $state('name asc');

  let total = $state(0);
  let data = $state<User[]>([]);

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

  function fetchUsers() {
    adminApi
      .adminGetUsers(
        filter.length > 0 ? filter : undefined,
        orderby.length > 0 ? orderby : undefined,
        (page - 1) * PerPage,
        PerPage
      )
      .then((res) => {
        if (res.data) {
          total = res.total;
          data = res.data.map(apiUserToTableDevice);
        }
      })
      .catch(handleApiError);
  }

  function startSearch() {
    page = 1;
    fetchUsers();
  }

  onMount(fetchUsers);
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
        placeholder="Input search query..."
        bind:value={filter}
        class="max-w-sm flex-1"
      />
      <Button class="text-xl cursor-pointer" onclick={startSearch}>
        <span> Search </span>
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

<script lang="ts">
  import { adminApi } from '$lib/api';
  import type { AdminUsersView } from '$lib/api/internal/v1/models/AdminUsersView';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
  import { Button } from '$lib/components/ui/button';
  import * as Card from '$lib/components/ui/card';
  import { onDestroy, onMount } from 'svelte';
  import { columns } from './columns';
  import DataTable from '$lib/components/Table/DataTableTemplate.svelte';
  import type { ColumnFiltersState, PaginationState, SortingState } from '@tanstack/table-core';
  import { Input } from '$lib/components/ui/input';

  import RotateCcw from '@lucide/svelte/icons/rotate-ccw';

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

  let nameSearch = $state('');
  let emailSearch = $state('');

  let data = $state<AdminUsersView[]>([]);
  let sorting = $state<SortingState>([]);
  let filters = $derived<ColumnFiltersState>([
    { id: 'name', value: nameSearch },
    { id: 'email', value: emailSearch },
  ]);
  let pagination = $state<PaginationState>({ pageIndex: 0, pageSize: 10 });

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
  <Card.Header>
    <Card.Title class="flex items-center justify-between space-x-2 text-3xl">
      Users
      <Button class="btn variant-filled-primary text-xl" onclick={fetchUsers}>
        <RotateCcw />
        <span> Refresh </span>
      </Button>
    </Card.Title>
  </Card.Header>
  <Card.Content>
    <div class="flex items-center space-x-4 py-4">
      <Input placeholder="Filter names..." bind:value={nameSearch} class="max-w-sm" />
      <Input placeholder="Filter emails..." bind:value={emailSearch} class="max-w-sm" />
    </div>
    <DataTable {data} {columns} {sorting} {filters} {pagination} />
  </Card.Content>
</div>

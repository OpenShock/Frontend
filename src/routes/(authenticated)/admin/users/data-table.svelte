<script lang="ts" generics="TData, TValue">
  import Table from '$lib/components/Table/TableTemplate.svelte';
  import { createSvelteTable, FlexRender } from '$lib/components/ui/data-table';
  import { Input } from '$lib/components/ui/input';
  import {
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    type ColumnDef,
    type ColumnFiltersState,
    type PaginationState,
    type SortingState,
  } from '@tanstack/table-core';

  type DataTableProps<TData, TValue> = {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
  };

  let { columns, data }: DataTableProps<TData, TValue> = $props();

  let pagination = $state<PaginationState>({ pageIndex: 0, pageSize: 10 });
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

  function searchNameChangedHandler(e: Event & { currentTarget: EventTarget & HTMLInputElement }) {
    table.getColumn('name')?.setFilterValue(e.currentTarget.value);
  }
  function searchEmailChangedHandler(e: Event & { currentTarget: EventTarget & HTMLInputElement }) {
    table.getColumn('name')?.setFilterValue(e.currentTarget.value);
  }
</script>

<div>
  <div class="flex items-center space-x-4 py-4">
    <Input
      placeholder="Filter names..."
      value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
      onchange={searchNameChangedHandler}
      oninput={searchNameChangedHandler}
      class="max-w-sm"
    />
    <Input
      placeholder="Filter emails..."
      value={(table.getColumn('email')?.getFilterValue() as string) ?? ''}
      onchange={searchEmailChangedHandler}
      oninput={searchEmailChangedHandler}
      class="max-w-sm"
    />
  </div>
  <Table {table} {columns} />
</div>

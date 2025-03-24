<script lang="ts" generics="TData, TValue">
  import { createSvelteTable } from '$lib/components/ui/data-table';
  import Table from '$lib/components/Table/TableTemplate.svelte';
  import {
    getCoreRowModel,
    getFilteredRowModel,
    type ColumnDef,
    type ColumnFiltersState,
  } from '@tanstack/table-core';

  type DataTableProps<TData, TValue> = {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
  };

  let { columns, data }: DataTableProps<TData, TValue> = $props();

  let columnFilters = $state<ColumnFiltersState>([]);

  const table = createSvelteTable({
    get data() {
      return data;
    },
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnFiltersChange: (updater) => {
      if (typeof updater === 'function') {
        columnFilters = updater(columnFilters);
      } else {
        columnFilters = updater;
      }
    },
    state: {
      get columnFilters() {
        return columnFilters;
      },
    },
  });
</script>

<Table {table} {columns} />
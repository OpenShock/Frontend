<script lang="ts" generics="TData, TValue">
  import Table from '$lib/components/Table/TableTemplate.svelte';
  import { createSvelteTable } from '$lib/components/ui/data-table';
  import {
    getCoreRowModel,
    getSortedRowModel,
    type ColumnDef,
    type SortingState,
  } from '@tanstack/table-core';

  type DataTableProps<TData, TValue> = {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
  };

  let { columns, data }: DataTableProps<TData, TValue> = $props();

  let sorting = $state<SortingState>([]);

  const table = createSvelteTable({
    get data() {
      return data;
    },
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: (updater) => {
      if (typeof updater === 'function') {
        sorting = updater(sorting);
      } else {
        sorting = updater;
      }
    },
    state: {
      get sorting() {
        return sorting;
      },
    },
  });
</script>

<Table {table} {columns} />

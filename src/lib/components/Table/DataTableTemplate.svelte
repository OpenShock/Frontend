<script lang="ts" generics="TData, TValue">
  import { createSvelteTable, FlexRender } from '$lib/components/ui/data-table';
  import {
    Table as TableRoot,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell,
  } from '$lib/components/ui/table';
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

  type Props = {
    data: TData[];
    columns: ColumnDef<TData, TValue>[];
    sorting?: SortingState;
    filters?: ColumnFiltersState;
    pagination?: PaginationState;
  };

  let {
    data,
    columns,
    sorting = $bindable(),
    filters = $bindable(),
    pagination = $bindable(),
  }: Props = $props();

  const table = createSvelteTable({
    get data() {
      return data;
    },
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: sorting ? getSortedRowModel() : undefined,
    getFilteredRowModel: filters ? getFilteredRowModel() : undefined,
    getPaginationRowModel: pagination ? getPaginationRowModel() : undefined,
    onSortingChange: (updater) => {
      if (!sorting) return;
      if (typeof updater === 'function') {
        sorting = updater(sorting);
      } else {
        sorting = updater;
      }
    },
    onColumnFiltersChange: (updater) => {
      if (!filters) return;
      if (typeof updater === 'function') {
        filters = updater(filters);
      } else {
        filters = updater;
      }
    },
    onPaginationChange: (updater) => {
      if (!pagination) return;
      if (typeof updater === 'function') {
        pagination = updater(pagination);
      } else {
        pagination = updater;
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
        return filters;
      },
    },
  });
</script>

<div class="max-h-[60vh] overflow-y-auto rounded-md border">
  <TableRoot>
    <TableHeader>
      {#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
        <TableRow>
          {#each headerGroup.headers as header (header.id)}
            <TableHead>
              {#if !header.isPlaceholder}
                <FlexRender
                  content={header.column.columnDef.header}
                  context={header.getContext()}
                />
              {/if}
            </TableHead>
          {/each}
        </TableRow>
      {/each}
    </TableHeader>
    <TableBody>
      {#each table.getRowModel().rows as row (row.id)}
        <TableRow data-state={row.getIsSelected() && 'selected'}>
          {#each row.getVisibleCells() as cell (cell.id)}
            <TableCell>
              <FlexRender content={cell.column.columnDef.cell} context={cell.getContext()} />
            </TableCell>
          {/each}
        </TableRow>
      {:else}
        <TableRow>
          <TableCell colspan={columns.length} class="h-24 text-center">No results.</TableCell>
        </TableRow>
      {/each}
    </TableBody>
  </TableRoot>
</div>

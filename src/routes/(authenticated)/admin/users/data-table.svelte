<script lang="ts" generics="TData, TValue">
  import {
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    type SortingState,
    type PaginationState,
    type ColumnFiltersState,
  } from '@tanstack/table-core';
  import { createSvelteTable, FlexRender } from '$lib/components/ui/data-table';
  import { Input } from '$lib/components/ui/input';
  import * as Table from '$lib/components/ui/table';

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
  <div class="flex items-center py-4 space-x-4">
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
  <div class="rounded-md border">
    <Table.Root>
      <Table.Header>
        {#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
          <Table.Row>
            {#each headerGroup.headers as header (header.id)}
              <Table.Head>
                {#if !header.isPlaceholder}
                  <FlexRender
                    content={header.column.columnDef.header}
                    context={header.getContext()}
                  />
                {/if}
              </Table.Head>
            {/each}
          </Table.Row>
        {/each}
      </Table.Header>
      <Table.Body>
        {#each table.getRowModel().rows as row (row.id)}
          <Table.Row data-state={row.getIsSelected() && 'selected'}>
            {#each row.getVisibleCells() as cell (cell.id)}
              <Table.Cell>
                <FlexRender content={cell.column.columnDef.cell} context={cell.getContext()} />
              </Table.Cell>
            {/each}
          </Table.Row>
        {:else}
          <Table.Row>
            <Table.Cell colspan={columns.length} class="h-24 text-center">No results.</Table.Cell>
          </Table.Row>
        {/each}
      </Table.Body>
    </Table.Root>
  </div>
</div>

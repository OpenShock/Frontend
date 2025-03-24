<script lang="ts" generics="TData, TValue">
  import { FlexRender } from '$lib/components/ui/data-table';
  import {
    Table as TableRoot,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell,
  } from '$lib/components/ui/table';
  import type { Table, ColumnDef } from '@tanstack/table-core';

  let { table, columns }: { table: Table<TData>; columns: ColumnDef<TData, TValue>[] } = $props();
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

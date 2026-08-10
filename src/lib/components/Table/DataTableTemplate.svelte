<script lang="ts" generics="TFeatures extends SortableTableFeatures, TData extends RowData">
  import {
    FlexRender,
    createTable,
    type ColumnDef,
    type RowData,
    type SortingState,
    type TableFeatures,
    type TableOptions,
    type Updater,
  } from '@tanstack/svelte-table';
  import * as Table from '@openshock/svelte-core/components/ui/table';
  import { cn } from '@openshock/svelte-core/utils/shadcn.js';
  import type { SortableTableFeatures } from './types';

  interface Props {
    data: TData[];
    columns: ColumnDef<TFeatures, TData>[];
    /** The table's feature set, from its colocated `data-table-features.ts`. */
    features: TFeatures;
    /**
     * Bind this only when the page needs to read the sort back — e.g. to build
     * a server-side `$orderby`. Left unbound, the table owns its own sorting
     * state, which is what v9 prefers.
     */
    sorting?: SortingState;
    /** Set when the rows arrive already sorted (server-side ordering). */
    manualSorting?: boolean;
    onRowClick?: (row: TData) => void;
    class?: string;
  }

  let {
    data,
    columns,
    features,
    sorting = $bindable(),
    manualSorting = false,
    onRowClick,
    class: className,
  }: Props = $props();

  // A `state` entry that resolves to undefined makes v9 fall back to
  // `initialState` rather than to the table's own atom, so the sorting slice is
  // only handed over when the parent actually owns it — an unbound `sorting`
  // leaves the table managing its own.
  const isControlled = sorting !== undefined;

  // Checked against the fully-populated feature shape and widened once, for the
  // same reason as `ColumnUtils`: `TableOptions` is feature-mapped, so it can't
  // be satisfied structurally while `TFeatures` is still a type parameter.
  // Only `data` needs a reactive getter — the feature set, columns and sorting
  // mode are fixed for the lifetime of a given table.
  /* svelte-ignore state_referenced_locally */
  const options: TableOptions<TableFeatures, TData> = {
    features,
    get data() {
      return data;
    },
    columns: columns as unknown as ColumnDef<TableFeatures, TData>[],
    manualSorting,
    state: isControlled
      ? {
          get sorting() {
            return sorting;
          },
        }
      : undefined,
    onSortingChange: isControlled
      ? (updater: Updater<SortingState>) => {
          sorting = typeof updater === 'function' ? updater(sorting ?? []) : updater;
        }
      : undefined,
  };

  const table = createTable(options as unknown as TableOptions<TFeatures, TData>);
</script>

<div class={cn('overflow-y-auto rounded-md border', className)}>
  <Table.Root>
    <Table.Header>
      {#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
        <Table.Row>
          {#each headerGroup.headers as header (header.id)}
            <Table.Head colspan={header.colSpan}>
              {#if !header.isPlaceholder}
                <FlexRender {header} />
              {/if}
            </Table.Head>
          {/each}
        </Table.Row>
      {/each}
    </Table.Header>
    <Table.Body>
      {#each table.getRowModel().rows as row (row.id)}
        <Table.Row onclick={() => onRowClick?.(row.original)}>
          {#each row.getAllCells() as cell (cell.id)}
            <Table.Cell>
              <FlexRender {cell} />
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

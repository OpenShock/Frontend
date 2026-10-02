<script lang="ts" generics="TFeatures extends DataTableFeatures, TData extends RowData">
  import { ChevronRight } from '@lucide/svelte';
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
  import { IsMobile } from '@openshock/svelte-core/hooks/is-mobile.svelte.js';
  import { cn } from '@openshock/svelte-core/utils';
  import type {
    DataTable,
    DataTableColumn,
    DataTableColumnMeta,
    DataTableFeatures,
    DataTableRow,
  } from './types';

  interface Props {
    data: TData[];
    columns: ColumnDef<TFeatures, TData>[];
    /** The table's feature set, from its colocated `data-table-features.ts`. */
    features: TFeatures;
    /**
     * The column ids worth a narrow screen's width. Every other column
     * collapses into a per-row detail panel behind a chevron, rather than
     * leaving the table to scroll sideways. The actions column is always kept.
     * Left unset, nothing collapses.
     */
    mobileColumns?: string[];
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
    mobileColumns,
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
    // The detail panel is rendered here from the row's hidden cells rather than
    // from sub-rows, so there is no expanded row model to flatten and every row
    // can open. Whether the chevron is offered at all is a template decision.
    manualExpanding: true,
    getRowCanExpand: () => true,
    // Omit these when uncontrolled: an explicit `onSortingChange: undefined`
    // replaces table-core's default handler and sorting silently stops working.
    ...(isControlled && {
      state: {
        get sorting() {
          return sorting;
        },
      },
      onSortingChange: (updater: Updater<SortingState>) => {
        sorting = typeof updater === 'function' ? updater(sorting ?? []) : updater;
      },
    }),
  };

  const table = createTable(options as unknown as TableOptions<TFeatures, TData>) as DataTable<
    TFeatures,
    TData
  >;

  const isMobile = new IsMobile();

  // Visibility is pushed into the table rather than bound through `state`: the
  // ids being set are the table's own column ids, which don't exist yet while
  // `options` is being built.
  $effect(() => {
    if (!mobileColumns) return;

    const collapse = isMobile.current;
    const keep = new Set([...mobileColumns, 'actions']);

    table.setColumnVisibility(
      Object.fromEntries(
        table.getAllLeafColumns().map((column) => [column.id, !collapse || keep.has(column.id)])
      )
    );

    // Widening the viewport takes the detail panels away with it, so the rows
    // they belonged to shouldn't stay marked open underneath.
    if (!collapse) table.resetExpanded(true);
  });

  let allColumns = $derived(table.getAllLeafColumns() as DataTableColumn<TFeatures, TData>[]);
  let collapsedColumns = $derived(allColumns.filter((column) => !column.getIsVisible()));
  let hasCollapsed = $derived(collapsedColumns.length > 0);
  let rows = $derived(table.getRowModel().rows as DataTableRow<TFeatures, TData>[]);

  // The chevron column is rendered outside the column defs, so it has to be
  // counted back in for the detail row to span the full width.
  let detailColspan = $derived(table.getVisibleLeafColumns().length + 1);

  // Keyed by column rather than by cell so the panel lists the collapsed values
  // in column order, and so each one still has the column to take its name from.
  function collapsedEntries(row: DataTableRow<TFeatures, TData>) {
    const cellsByColumnId = new Map(row.getAllCells().map((cell) => [cell.column.id, cell]));
    return collapsedColumns.flatMap((column) => {
      const cell = cellsByColumnId.get(column.id);
      return cell ? [{ column, cell }] : [];
    });
  }

  // `columnDef.meta` is resolved from the feature set's `columnMeta` slot, which
  // is another of the mapped types that can't reduce against a generic
  // `TFeatures`, so the shape every table declares is restated here.
  function columnLabel(column: DataTableColumn<TFeatures, TData>) {
    return (column.columnDef.meta as DataTableColumnMeta | undefined)?.label ?? column.id;
  }

  // A control inside a cell — the actions menu, the collapse chevron — was
  // clicked for its own sake, not as a click on the row behind it.
  function handleRowClick(row: TData, event: MouseEvent) {
    if (!onRowClick) return;
    if ((event.target as HTMLElement).closest('button, a, input, label, [role="menuitem"]')) return;
    onRowClick(row);
  }
</script>

<div
  class={cn(
    // Full-bleed on mobile: the negative margin cancels `Container`'s `px-4`, so
    // the table reaches both edges, and the side border and radius that framed
    // it would only trace the viewport there.
    '-mx-4 overflow-y-auto border-y sm:mx-0 sm:rounded-md sm:border',
    // The table takes the height its page has left over and scrolls the rows
    // inside it, so a page header and a pagination footer stay put instead of
    // riding away on a long list. This needs the chain above it to carry the
    // height down — `main` is the vertical scroller, `Container` is `h-full`, and
    // each page's own wrapper has to be a `min-h-0 flex-1 flex-col` in turn.
    // Pass `min-h-*` in `class` to give the table a floor instead.
    'min-h-0 flex-1',
    // Tighter rows on mobile, where the vertical space is worth more than the
    // breathing room. This belongs here rather than on the shadcn cell and head
    // primitives, which `svelte-core`'s update-shadcn script regenerates from
    // the registry; a descendant selector also outranks their own padding
    // without depending on how the utilities happen to be ordered.
    '[&_td]:py-1 sm:[&_td]:py-2 [&_th]:h-8 sm:[&_th]:h-10',
    className
  )}
>
  <Table.Root>
    <Table.Header>
      {#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
        <Table.Row>
          {#if hasCollapsed}
            <Table.Head class="w-6" />
          {/if}
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
      {#each rows as row (row.id)}
        <Table.Row
          class={onRowClick ? 'cursor-pointer' : undefined}
          onclick={(e) => handleRowClick(row.original, e)}
        >
          {#if hasCollapsed}
            <Table.Cell class="pr-0">
              <button
                class="text-muted-foreground flex items-center"
                aria-expanded={row.getIsExpanded()}
                aria-label={row.getIsExpanded() ? 'Hide details' : 'Show details'}
                onclick={() => row.toggleExpanded()}
              >
                <ChevronRight
                  class="size-4 transition-transform {row.getIsExpanded() ? 'rotate-90' : ''}"
                />
              </button>
            </Table.Cell>
          {/if}
          {#each row.getVisibleCells() as cell (cell.id)}
            <Table.Cell>
              <FlexRender {cell} />
            </Table.Cell>
          {/each}
        </Table.Row>
        {#if hasCollapsed && row.getIsExpanded()}
          <Table.Row class="hover:bg-transparent">
            <!-- Cells are `whitespace-nowrap` so the columns stay legible; the
                 panel undoes that, since a long value wrapping is the whole
                 point of not making the row scroll sideways. -->
            <Table.Cell colspan={detailColspan} class="bg-muted/30 pl-8 whitespace-normal">
              <!-- The panel carries its own vertical padding, since the density
                   rule above reaches this cell too. -->
              <dl class="grid grid-cols-[auto_1fr] items-baseline gap-x-4 gap-y-1 py-1">
                {#each collapsedEntries(row) as { column, cell } (column.id)}
                  <dt class="text-muted-foreground text-xs">{columnLabel(column)}</dt>
                  <dd class="min-w-0 break-words">
                    <FlexRender {cell} />
                  </dd>
                {/each}
              </dl>
            </Table.Cell>
          </Table.Row>
        {/if}
      {:else}
        <Table.Row>
          <Table.Cell colspan={columns.length} class="h-24 text-center">No results.</Table.Cell>
        </Table.Row>
      {/each}
    </Table.Body>
  </Table.Root>
</div>

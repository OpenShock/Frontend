<script lang="ts" generics="TFeatures extends SortableTableFeatures, TData extends RowData">
  import { ArrowDown, ArrowUp, ArrowUpDown } from '@lucide/svelte';
  import type { Column, Column_RowSorting, RowData } from '@tanstack/svelte-table';
  import type { SortableTableFeatures } from './types';

  interface Props {
    name: string;
    // The sorting half is spelled out because v9 only folds it into `Column`
    // once `TFeatures` is a concrete feature set, which it isn't here.
    column: Column<TFeatures, TData> & Column_RowSorting<TFeatures, TData>;
  }

  let { name, column }: Props = $props();

  let direction = $derived(column.getIsSorted());
</script>

<button
  class="flex items-center text-xs sm:text-sm"
  onclick={() => column.toggleSorting(direction === 'asc')}
  title="Sort by {name}, {direction === 'asc'
    ? 'ascending'
    : direction === 'desc'
      ? 'descending'
      : 'unsorted'}"
>
  {name}
  {#if direction === 'asc'}
    <ArrowUp class="ml-2 size-3 sm:size-4" />
  {:else if direction === 'desc'}
    <ArrowDown class="ml-2 size-3 sm:size-4" />
  {:else}
    <ArrowUpDown class="ml-2 size-3 sm:size-4" />
  {/if}
</button>

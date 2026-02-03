<script lang="ts" generics="TData">
  import { ArrowDown, ArrowUp, ArrowUpDown } from '@lucide/svelte';
  import type { Column } from '@tanstack/table-core';

  interface Props {
    name: string;
    column: Column<TData, unknown>;
  }

  let { name, column }: Props = $props();

  let direction = $derived(column.getIsSorted());
</script>

<button
  class="flex items-center text-xs sm:text-sm"
  onclick={() => column.toggleSorting(direction === 'asc')}
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

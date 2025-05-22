<script lang="ts" generics="TData">
  import { ArrowDown, ArrowUp, ArrowUpDown } from '@lucide/svelte';
  import type { Column } from '@tanstack/table-core';
  import { Button } from '$lib/components/ui/button';
  import type { ComponentProps } from 'svelte';

  type Props = ComponentProps<typeof Button> & { name: string; column: Column<TData, unknown> };

  let { variant = 'ghost', name, column, ...restProps }: Props = $props();

  let direction = $derived(column.getIsSorted());
</script>

<Button {variant} {...restProps} onclick={() => column.toggleSorting(direction === 'asc')}>
  {name}
  {#if direction === 'asc'}
    <ArrowUp class="ml-2 size-4" />
  {:else if direction === 'desc'}
    <ArrowDown class="ml-2 size-4" />
  {:else}
    <ArrowUpDown class="ml-2 size-4" />
  {/if}
</Button>

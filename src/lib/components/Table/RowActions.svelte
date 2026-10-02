<script lang="ts" module>
  import type { Component } from 'svelte';

  export interface RowAction {
    label: string;
    /** Lucide icon component. Rendered at size-4 to match the rest of the menu. */
    icon?: Component;
    onclick?: () => void;
    disabled?: boolean;
    /** Tints the item with the destructive token. */
    destructive?: boolean;
    /** Draws a separator above this item. */
    separatorBefore?: boolean;
  }
</script>

<script lang="ts">
  import { TableActionMenu } from '@openshock/svelte-core/components';
  import * as DropdownMenu from '@openshock/svelte-core/components/ui/dropdown-menu';

  interface Props {
    /** Group heading, e.g. "Hub". Omit for an unlabelled menu. */
    label?: string;
    actions: RowAction[];
  }

  let { label, actions }: Props = $props();
</script>

<TableActionMenu>
  {#if label}
    <DropdownMenu.Label>{label}</DropdownMenu.Label>
  {/if}
  <DropdownMenu.Group>
    {#each actions as action (action.label)}
      {#if action.separatorBefore}
        <DropdownMenu.Separator />
      {/if}
      <DropdownMenu.Item
        class={action.disabled
          ? undefined
          : action.destructive
            ? 'text-destructive cursor-pointer'
            : 'cursor-pointer'}
        disabled={action.disabled}
        onclick={action.onclick}
      >
        {#if action.icon}
          {@const Icon = action.icon}
          <Icon class="size-4" />
        {/if}
        {action.label}
      </DropdownMenu.Item>
    {/each}
  </DropdownMenu.Group>
</TableActionMenu>

<script lang="ts">
  import Ellipsis from '@lucide/svelte/icons/ellipsis';
  import { type ConfigurationItemDto } from '$lib/api/internal/v1';
  import { Button } from '$lib/components/ui/button';
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
  import ItemDeleteDialog from './dialog-item-delete.svelte';
  import ItemEditDialog from './dialog-item-edit.svelte';

  interface Props {
    item: ConfigurationItemDto;
    onChange: () => void;
  }

  let { item, onChange }: Props = $props();

  let editDialogOpen = $state<boolean>(false);
  let deleteDialogOpen = $state<boolean>(false);
</script>

<ItemEditDialog bind:open={editDialogOpen} {item} onEdited={onChange} />
<ItemDeleteDialog bind:open={deleteDialogOpen} {item} onDeleted={onChange} />

<DropdownMenu.Root>
  <DropdownMenu.Trigger>
    {#snippet child({ props })}
      <Button {...props} variant="ghost" size="icon" class="relative size-8 p-0">
        <span class="sr-only">Open menu</span>
        <Ellipsis class="size-4" />
      </Button>
    {/snippet}
  </DropdownMenu.Trigger>
  <DropdownMenu.Content>
    <DropdownMenu.Item onclick={() => (editDialogOpen = true)}>Edit</DropdownMenu.Item>
    <DropdownMenu.Item onclick={() => (deleteDialogOpen = true)}>Delete</DropdownMenu.Item>
  </DropdownMenu.Content>
</DropdownMenu.Root>

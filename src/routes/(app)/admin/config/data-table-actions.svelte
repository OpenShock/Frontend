<script lang="ts">
  import { type ConfigurationItemDto } from '$lib/api/internal/v1';
  import TableActionMenu from '$lib/components/TableActionMenu.svelte';
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

<TableActionMenu>
  <DropdownMenu.Item onclick={() => (editDialogOpen = true)}>Edit</DropdownMenu.Item>
  <DropdownMenu.Item onclick={() => (deleteDialogOpen = true)}>Delete</DropdownMenu.Item>
</TableActionMenu>

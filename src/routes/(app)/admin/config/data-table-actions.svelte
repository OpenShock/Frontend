<script lang="ts">
  import RowActions from '#lib/components/Table/RowActions.svelte';
  import { Pencil, Trash2 } from '@lucide/svelte';
  import type { ConfigurationItemDto } from '#lib/api/index.js';
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

<RowActions
  label="Item"
  actions={[
    { label: 'Edit', icon: Pencil, onclick: () => (editDialogOpen = true) },
    {
      label: 'Delete',
      icon: Trash2,
      onclick: () => (deleteDialogOpen = true),
      destructive: true,
      separatorBefore: true,
    },
  ]}
/>

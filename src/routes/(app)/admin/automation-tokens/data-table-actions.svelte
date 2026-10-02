<script lang="ts">
  import { TableActionMenu } from '@openshock/svelte-core/components';
  import * as DropdownMenu from '@openshock/svelte-core/components/ui/dropdown-menu';
  import { copyToClipboard } from '@openshock/svelte-core/utils';
  import { Copy, Pencil, RefreshCw, Trash2 } from '@lucide/svelte';
  import type { AutomationToken } from './columns';
  import TokenDeleteDialog from './dialog-token-delete.svelte';
  import TokenEditDialog from './dialog-token-edit.svelte';
  import TokenRotateDialog from './dialog-token-rotate.svelte';

  interface Props {
    token: AutomationToken;
    onChange: () => void;
  }

  let { token, onChange }: Props = $props();

  let editDialogOpen = $state<boolean>(false);
  let rotateDialogOpen = $state<boolean>(false);
  let deleteDialogOpen = $state<boolean>(false);

  const copyId = () => copyToClipboard(token.id, 'ID copied to clipboard');
</script>

<TokenEditDialog bind:open={editDialogOpen} {token} onEdited={onChange} />
<TokenRotateDialog bind:open={rotateDialogOpen} {token} onRotated={onChange} />
<TokenDeleteDialog bind:open={deleteDialogOpen} {token} onDeleted={onChange} />

<TableActionMenu>
  <DropdownMenu.Label>Automation token</DropdownMenu.Label>
  <DropdownMenu.Group>
    <DropdownMenu.Item class="cursor-pointer" onclick={() => (editDialogOpen = true)}>
      <Pencil class="size-4" />
      Edit
    </DropdownMenu.Item>
    <DropdownMenu.Item class="cursor-pointer" onclick={() => (rotateDialogOpen = true)}>
      <RefreshCw class="size-4" />
      Rotate secret
    </DropdownMenu.Item>
    <DropdownMenu.Separator />
    <DropdownMenu.Item class="cursor-pointer" onclick={copyId}>
      <Copy class="size-4" />
      Copy ID
    </DropdownMenu.Item>
    <DropdownMenu.Separator />
    <DropdownMenu.Item
      class="cursor-pointer text-red-500"
      onclick={() => (deleteDialogOpen = true)}
    >
      <Trash2 class="size-4" />
      Delete
    </DropdownMenu.Item>
  </DropdownMenu.Group>
</TableActionMenu>

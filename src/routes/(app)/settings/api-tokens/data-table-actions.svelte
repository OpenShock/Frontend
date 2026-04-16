<script lang="ts">
  import type { TokenResponse } from '$lib/api/internal/v1';
  import TableActionMenu from '$lib/components/TableActionMenu.svelte';
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
  import { copyToClipboard } from '$lib/utils/clipboard.svelte';
  import TokenDeleteDialog from './dialog-token-delete.svelte';
  import TokenEditDialog from './dialog-token-edit.svelte';

  interface Props {
    token: TokenResponse;
    onEdit: (id: string, updater: (token: TokenResponse) => TokenResponse) => void;
    onDeleted: (id: string) => void;
  }

  let { token, onEdit, onDeleted }: Props = $props();

  let editDialogOpen = $state<boolean>(false);
  let deleteDialogOpen = $state<boolean>(false);

  const copyId = () => copyToClipboard(token.id, 'ID copied to clipboard');

  function openDeleteDialog() {
    deleteDialogOpen = true;
    console.log('Delete dialog opened for token:', $state.snapshot(token));
  }
</script>

<TokenEditDialog open={editDialogOpen} {token} {onEdit} />
<TokenDeleteDialog open={deleteDialogOpen} {token} {onDeleted} />

<TableActionMenu>
  <DropdownMenu.Item class="cursor-pointer" onclick={copyId}>Copy ID</DropdownMenu.Item>
  <DropdownMenu.Item class="cursor-pointer" onclick={() => (editDialogOpen = true)}>
    Edit
  </DropdownMenu.Item>
  <DropdownMenu.Item class="cursor-pointer" onclick={openDeleteDialog}>Delete</DropdownMenu.Item>
</TableActionMenu>

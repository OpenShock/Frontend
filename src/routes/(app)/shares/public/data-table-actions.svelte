<script lang="ts">
  import { goto } from '$app/navigation';
  import { resolve } from '$app/paths';
  import type { OwnPublicShareResponse } from '$lib/api';
  import TableActionMenu from '$lib/components/TableActionMenu.svelte';
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
  import { copyToClipboard } from '$lib/utils/clipboard.svelte';
  import { Copy, Eye, Pencil, Trash2 } from '@lucide/svelte';
  import SharelinkDeleteDialog from './dialog-publicshare-delete.svelte';

  interface Props {
    publicShare: OwnPublicShareResponse;
    onChange: () => void;
  }

  let { publicShare, onChange }: Props = $props();

  let deleteDialogOpen = $state<boolean>(false);

  const copyId = () => copyToClipboard(publicShare.id, 'ID copied to clipboard');
</script>

<SharelinkDeleteDialog bind:open={deleteDialogOpen} {publicShare} onDeleted={onChange} />

<span class="float-right">
  <TableActionMenu>
    <DropdownMenu.Label>Public Share</DropdownMenu.Label>
    <DropdownMenu.Group>
      <DropdownMenu.Item
        class="cursor-pointer"
        onclick={() => goto(resolve(`/shares/public/${publicShare.id}`))}
      >
        <Eye class="size-4" />
        View
      </DropdownMenu.Item>
      <DropdownMenu.Item
        class="cursor-pointer"
        onclick={() => goto(resolve(`/shares/public/${publicShare.id}/edit`))}
      >
        <Pencil class="size-4" />
        Edit
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
</span>

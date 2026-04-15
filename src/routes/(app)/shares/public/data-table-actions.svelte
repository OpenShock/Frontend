<script lang="ts">
  import { goto } from '$app/navigation';
  import { resolve } from '$app/paths';
  import type { OwnPublicShareResponse } from '$lib/api/internal/v1';
  import TableActionMenu from '$lib/components/TableActionMenu.svelte';
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
  import { copyToClipboard } from '$lib/utils/clipboard.svelte';
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
    <DropdownMenu.Item onclick={() => goto(resolve(`/shares/public/${publicShare.id}`))}>
      View
    </DropdownMenu.Item>
    <DropdownMenu.Item onclick={() => goto(resolve(`/shares/public/${publicShare.id}/edit`))}>
      Edit
    </DropdownMenu.Item>
    <DropdownMenu.Item onclick={() => (deleteDialogOpen = true)}>Delete</DropdownMenu.Item>
    <DropdownMenu.Item onclick={copyId}>Copy ID</DropdownMenu.Item>
  </TableActionMenu>
</span>

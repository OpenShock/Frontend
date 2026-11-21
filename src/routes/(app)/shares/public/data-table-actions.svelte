<script lang="ts">
  import { m } from '#lib/paraglide/messages.js';
  import { goto } from '$app/navigation';
  import { resolve } from '$app/paths';
  import type { OwnPublicShareResponse } from '#lib/api/index.js';
  import { TableActionMenu } from '@openshock/svelte-core/components';
  import * as DropdownMenu from '@openshock/svelte-core/components/ui/dropdown-menu';
  import { copyToClipboard } from '@openshock/svelte-core/utils';
  import { Copy, Eye, Pencil, Trash2 } from '@lucide/svelte';
  import SharelinkDeleteDialog from './dialog-publicshare-delete.svelte';

  interface Props {
    publicShare: OwnPublicShareResponse;
    onChange: () => void;
  }

  let { publicShare, onChange }: Props = $props();

  let deleteDialogOpen = $state<boolean>(false);

  const copyId = () => copyToClipboard(publicShare.id, m.common_id_copied());
</script>

<SharelinkDeleteDialog bind:open={deleteDialogOpen} {publicShare} onDeleted={onChange} />

<span class="float-right">
  <TableActionMenu>
    <DropdownMenu.Label>{m.public_share_label()}</DropdownMenu.Label>
    <DropdownMenu.Group>
      <DropdownMenu.Item
        class="cursor-pointer"
        onclick={() => goto(resolve(`shares/public/${publicShare.id}`))}
        ><Eye class="size-4" />{m.common_view()}</DropdownMenu.Item
      >

      <DropdownMenu.Item
        class="cursor-pointer"
        onclick={() => goto(resolve(`shares/public/${publicShare.id}/edit`))}
        ><Pencil class="size-4" />{m.common_edit()}</DropdownMenu.Item
      >

      <DropdownMenu.Separator />
      <DropdownMenu.Item class="cursor-pointer" onclick={copyId}>
        <Copy class="size-4" />
        {m.common_copy_id()}
      </DropdownMenu.Item>
      <DropdownMenu.Separator />
      <DropdownMenu.Item
        class="text-destructive cursor-pointer"
        onclick={() => (deleteDialogOpen = true)}
        ><Trash2 class="size-4" />{m.common_delete()}</DropdownMenu.Item
      >
    </DropdownMenu.Group>
  </TableActionMenu>
</span>

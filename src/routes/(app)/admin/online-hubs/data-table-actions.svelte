<script lang="ts">
  import { goto } from '$app/navigation';
  import { resolve } from '$app/paths';
  import TableActionMenu from '$core/components/TableActionMenu.svelte';
  import * as DropdownMenu from '$hadcn/dropdown-menu';
  import { copyToClipboard } from '$core/utils/clipboard.svelte';
  import { Copy, Pencil, Trash2, User } from '@lucide/svelte';
  import type { OnlineHub } from './columns';

  interface Props {
    hub: OnlineHub;
  }

  let { hub }: Props = $props();

  const copyId = () => copyToClipboard(hub.id, 'ID copied to clipboard');
  const copyUserId = () => copyToClipboard(hub.owner.id, 'User ID copied to clipboard');
</script>

<TableActionMenu>
  <DropdownMenu.Label>Hub</DropdownMenu.Label>
  <DropdownMenu.Group>
    <DropdownMenu.Item
      class="cursor-pointer"
      onclick={() => goto(resolve(`/admin/users/${hub.owner.id}`))}
    >
      <User class="size-4" />
      View User
    </DropdownMenu.Item>
    <DropdownMenu.Item class="cursor-pointer">
      <Pencil class="size-4" />
      Edit
    </DropdownMenu.Item>
    <DropdownMenu.Separator />
    <DropdownMenu.Item class="cursor-pointer" onclick={copyId}>
      <Copy class="size-4" />
      Copy ID
    </DropdownMenu.Item>
    <DropdownMenu.Item class="cursor-pointer" onclick={copyUserId}>
      <Copy class="size-4" />
      Copy User ID
    </DropdownMenu.Item>
    <DropdownMenu.Separator />
    <DropdownMenu.Item class="cursor-pointer text-red-500">
      <Trash2 class="size-4" />
      Delete
    </DropdownMenu.Item>
  </DropdownMenu.Group>
</TableActionMenu>

<script lang="ts">
  import { goto } from '$app/navigation';
  import { resolve } from '$app/paths';
  import TableActionMenu from '$lib/components/TableActionMenu.svelte';
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
  import { copyToClipboard } from '$lib/utils/clipboard.svelte';
  import type { OnlineHub } from './columns';

  interface Props {
    hub: OnlineHub;
  }

  let { hub }: Props = $props();

  const copyId = () => copyToClipboard(hub.id, 'ID copied to clipboard');
  const copyUserId = () => copyToClipboard(hub.owner.id, 'User ID copied to clipboard');
</script>

<TableActionMenu>
  <DropdownMenu.Item onclick={copyId}>Copy ID</DropdownMenu.Item>
  <DropdownMenu.Item onclick={copyUserId}>Copy User ID</DropdownMenu.Item>
  <DropdownMenu.Item onclick={() => goto(resolve(`/admin/users/${hub.owner.id}`))}>
    View User
  </DropdownMenu.Item>
  <DropdownMenu.Item>Edit</DropdownMenu.Item>
  <DropdownMenu.Item>Delete</DropdownMenu.Item>
</TableActionMenu>

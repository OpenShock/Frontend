<script lang="ts">
  import { RoleType } from '$lib/api';
  import type { AdminUsersView } from '$lib/api';
  import TableActionMenu from '$core/components/TableActionMenu.svelte';
  import * as DropdownMenu from '$hadcn/dropdown-menu';
  import { copyToClipboard } from '$core/utils/clipboard.svelte';
  import { Copy, KeyRound, Pencil, ShieldPlus, Trash2 } from '@lucide/svelte';
  import UserDeleteDialog from './dialog-user-delete.svelte';
  import UserEditDialog from './dialog-user-edit.svelte';

  interface Props {
    user: AdminUsersView;
    onDeleted?: () => void;
  }

  let { user, onDeleted }: Props = $props();

  let editDialogOpen = $state<boolean>(false);
  let deleteDialogOpen = $state<boolean>(false);
  let isPrivileged = $derived(
    [RoleType.Admin, RoleType.System].some((role) => user.roles.includes(role))
  );

  const copyId = () => copyToClipboard(user.id, 'ID copied to clipboard');
</script>

<UserEditDialog bind:open={editDialogOpen} {user} />
<UserDeleteDialog bind:open={deleteDialogOpen} {user} {onDeleted} />

<TableActionMenu>
  <DropdownMenu.Label>User</DropdownMenu.Label>
  <DropdownMenu.Group>
    <DropdownMenu.Item class="cursor-pointer" onclick={() => (editDialogOpen = true)}>
      <Pencil class="size-4" />
      Edit
    </DropdownMenu.Item>
    <DropdownMenu.Item class="cursor-pointer">
      <ShieldPlus class="size-4" />
      Promote
    </DropdownMenu.Item>
    <DropdownMenu.Item class="cursor-pointer">
      <KeyRound class="size-4" />
      Reset password
    </DropdownMenu.Item>
    <DropdownMenu.Separator />
    <DropdownMenu.Item class="cursor-pointer" onclick={copyId}>
      <Copy class="size-4" />
      Copy ID
    </DropdownMenu.Item>
    <DropdownMenu.Separator />
    <DropdownMenu.Item
      onclick={() => (deleteDialogOpen = true)}
      disabled={isPrivileged}
      class={isPrivileged ? undefined : 'cursor-pointer text-red-500'}
    >
      <Trash2 class="size-4" />
      Delete
    </DropdownMenu.Item>
  </DropdownMenu.Group>
</TableActionMenu>

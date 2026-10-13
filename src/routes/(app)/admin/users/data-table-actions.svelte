<script lang="ts">
  import { goto } from '$app/navigation';
  import { resolve } from '$app/paths';
  import { RoleType } from '#lib/api/index.js';
  import type { AdminUsersView } from '#lib/api/index.js';
  import { TableActionMenu } from '@openshock/svelte-core/components';
  import * as DropdownMenu from '@openshock/svelte-core/components/ui/dropdown-menu';
  import { copyToClipboard } from '@openshock/svelte-core/utils';
  import { Copy, Eye, KeyRound, Pencil, Trash2 } from '@lucide/svelte';
  import UserDeleteDialog from './dialog-user-delete.svelte';
  import UserEditDialog from './dialog-user-edit.svelte';
  import SetPasswordDialog from './[userId=guid]/dialog-set-password.svelte';

  interface Props {
    user: AdminUsersView;
    onDeleted?: () => void;
  }

  let { user, onDeleted }: Props = $props();

  let editDialogOpen = $state<boolean>(false);
  let deleteDialogOpen = $state<boolean>(false);
  let passwordDialogOpen = $state<boolean>(false);
  let isPrivileged = $derived(
    [RoleType.Admin, RoleType.System].some((role) => user.roles.includes(role))
  );

  const copyId = () => copyToClipboard(user.id, 'ID copied to clipboard');
</script>

<UserEditDialog bind:open={editDialogOpen} {user} />
<UserDeleteDialog bind:open={deleteDialogOpen} {user} {onDeleted} />
<SetPasswordDialog
  bind:open={passwordDialogOpen}
  userId={user.id}
  userName={user.name}
  onChanged={() => {}}
/>

<TableActionMenu>
  <DropdownMenu.Label>User</DropdownMenu.Label>
  <DropdownMenu.Group>
    <DropdownMenu.Item
      class="cursor-pointer"
      onclick={() => goto(resolve(`admin/users/${user.id}`))}
    >
      <Eye class="size-4" />
      View details
    </DropdownMenu.Item>
    <DropdownMenu.Separator />
    <DropdownMenu.Item class="cursor-pointer" onclick={() => (editDialogOpen = true)}>
      <Pencil class="size-4" />
      Edit
    </DropdownMenu.Item>
    <DropdownMenu.Item class="cursor-pointer" onclick={() => (passwordDialogOpen = true)}>
      <KeyRound class="size-4" />
      Set password
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
      class={isPrivileged ? undefined : 'text-destructive cursor-pointer'}
    >
      <Trash2 class="size-4" />
      Delete
    </DropdownMenu.Item>
  </DropdownMenu.Group>
</TableActionMenu>

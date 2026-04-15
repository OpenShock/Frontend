<script lang="ts">
  import { type AdminUsersView, RoleType } from '$lib/api/internal/v1';
  import TableActionMenu from '$lib/components/TableActionMenu.svelte';
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
  import { copyToClipboard } from '$lib/utils/clipboard.svelte';
  import UserDeleteDialog from './dialog-user-delete.svelte';
  import UserEditDialog from './dialog-user-edit.svelte';

  interface Props {
    user: AdminUsersView;
  }

  let { user }: Props = $props();

  let editDialogOpen = $state<boolean>(false);
  let deleteDialogOpen = $state<boolean>(false);
  let isPrivileged = $derived(
    [RoleType.Admin, RoleType.System].some((role) => user.roles.includes(role))
  );

  const copyId = () => copyToClipboard(user.id, 'ID copied to clipboard');
</script>

<UserEditDialog bind:open={editDialogOpen} {user} />
<UserDeleteDialog bind:open={deleteDialogOpen} {user} />

<TableActionMenu>
  <DropdownMenu.Item onclick={copyId}>Copy ID</DropdownMenu.Item>
  <DropdownMenu.Item onclick={() => (editDialogOpen = true)}>Edit</DropdownMenu.Item>
  <DropdownMenu.Item>Promote</DropdownMenu.Item>
  <DropdownMenu.Item>Reset password</DropdownMenu.Item>
  <DropdownMenu.Item
    onclick={() => (deleteDialogOpen = true)}
    disabled={isPrivileged}
    class={isPrivileged ? undefined : 'text-red-500'}
  >
    Delete
  </DropdownMenu.Item>
</TableActionMenu>

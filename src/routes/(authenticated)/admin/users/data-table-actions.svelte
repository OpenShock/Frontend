<script lang="ts">
  import { RoleType, type AdminUsersView } from '$lib/api/internal/v1';
  import { Button } from '$lib/components/ui/button';
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
  import { toast } from 'svelte-sonner';
  import UserDeleteDialog from './dialog-user-delete.svelte';
  import UserEditDialog from './dialog-user-edit.svelte';

  import Ellipsis from '@lucide/svelte/icons/ellipsis';

  type Props = {
    user: AdminUsersView;
  };

  let { user }: Props = $props();

  let editDialogOpen = $state<boolean>(false);
  let deleteDialogOpen = $state<boolean>(false);
  let isPrivileged = $derived(
    [RoleType.Admin, RoleType.System].some((role) => user.roles.includes(role))
  );

  function copyId() {
    navigator.clipboard.writeText(user.id);
    toast.success('ID copied to clipboard');
  }
</script>

<UserEditDialog bind:open={editDialogOpen} {user} />
<UserDeleteDialog bind:open={deleteDialogOpen} {user} />

<DropdownMenu.Root>
  <DropdownMenu.Trigger>
    {#snippet child({ props })}
      <Button {...props} variant="ghost" size="icon" class="relative size-8 p-0">
        <span class="sr-only">Open menu</span>
        <Ellipsis class="size-4" />
      </Button>
    {/snippet}
  </DropdownMenu.Trigger>
  <DropdownMenu.Content>
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
  </DropdownMenu.Content>
</DropdownMenu.Root>

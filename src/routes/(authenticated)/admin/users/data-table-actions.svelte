<script lang="ts">
  import Ellipsis from 'lucide-svelte/icons/ellipsis';
  import { Button } from '$lib/components/ui/button';
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
  import { toast } from 'svelte-sonner';
  import type { User } from './columns';
  import { RankType } from '$lib/api/internal/v1';
  import DialogUserEdit from './dialog-user-edit.svelte';
  import DialogUserDelete from './dialog-user-delete.svelte';

  type Props = {
    user: User;
  };

  let { user }: Props = $props();

  let editUser = $state<boolean>(false);
  let deleteUser = $state<boolean>(false);
  let isPrivileged = $derived([RankType.Admin, RankType.System].includes(user.rank));

  function copyId() {
    navigator.clipboard.writeText(user.id);
    toast.success('ID copied to clipboard');
  }
</script>

<DialogUserEdit bind:open={editUser} {user} />
<DialogUserDelete bind:open={deleteUser} {user} />

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
    <DropdownMenu.Item onclick={() => (editUser = true)}>Edit</DropdownMenu.Item>
    <DropdownMenu.Item>Promote</DropdownMenu.Item>
    <DropdownMenu.Item>Reset password</DropdownMenu.Item>
    <DropdownMenu.Item
      onclick={() => (deleteUser = true)}
      disabled={isPrivileged}
      class={isPrivileged ? undefined : 'text-red-500'}
    >
      Delete
    </DropdownMenu.Item>
  </DropdownMenu.Content>
</DropdownMenu.Root>

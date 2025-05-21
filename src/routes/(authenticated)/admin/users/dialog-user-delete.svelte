<script lang="ts">
  import type { AdminUsersView } from '$lib/api/internal/v1';
  import AbsolutelySureButton from '$lib/components/AbsolutelySureButton.svelte';
  import * as Dialog from '$lib/components/ui/dialog';

  type Props = {
    open: boolean;
    user: AdminUsersView;
  };

  let { open = $bindable<boolean>(), user }: Props = $props();
</script>

<Dialog.Root bind:open={() => open, (o) => (open = o)}>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>Delete user</Dialog.Title>
      <Dialog.Description>
        Are you sure you want to delete <strong>{user.name}</strong>?<br />
        All data associated with this user will be permanently deleted.<br />
        <strong>This action is irreversible.</strong>
      </Dialog.Description>
    </Dialog.Header>
    <AbsolutelySureButton text="Delete" onconfirm={() => {}} />
  </Dialog.Content>
</Dialog.Root>

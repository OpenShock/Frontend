<script lang="ts">
  import { adminDeleteUser } from '$lib/api';
  import type { AdminUsersView } from '$lib/api';
  import { ConfirmDeleteDialog } from '@openshock/svelte-core/components/index.js';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
  import { toast } from 'svelte-sonner';

  interface Props {
    open: boolean;
    user: AdminUsersView;
    onDeleted?: () => void;
  }

  let { open = $bindable<boolean>(), user, onDeleted }: Props = $props();

  function onDeleteClicked() {
    adminDeleteUser({ path: { userId: user.id } })
      .then(() => {
        toast.success(`Deleted user ${user.name}`);
        onDeleted?.();
      })
      .catch(handleApiError)
      .finally(() => (open = false));
  }
</script>

<ConfirmDeleteDialog bind:open title="Delete user" onConfirm={onDeleteClicked}>
  {#snippet description()}
    Are you sure you want to delete <strong>{user.name}</strong>?<br />
    All data associated with this user will be permanently deleted.<br />
    <strong>This action is irreversible.</strong>
  {/snippet}
</ConfirmDeleteDialog>

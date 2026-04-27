<script lang="ts">
  import type { AdminUsersView } from '$lib/api/internal/v1';
  import ConfirmDeleteDialog from '$lib/components/ConfirmDeleteDialog.svelte';

  interface Props {
    open: boolean;
    user: AdminUsersView;
  }

  let { open = $bindable<boolean>(), user }: Props = $props();
</script>

<ConfirmDeleteDialog bind:open title="Delete user" onConfirm={() => {}}>
  {#snippet description()}
    Are you sure you want to delete <strong>{user.name}</strong>?<br />
    All data associated with this user will be permanently deleted.<br />
    <strong>This action is irreversible.</strong>
  {/snippet}
</ConfirmDeleteDialog>

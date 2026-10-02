<script lang="ts">
  import { type AdminUserViewApiToken, adminDeleteApiToken } from '#lib/api/index.js';
  import { ConfirmDeleteDialog } from '@openshock/svelte-core/components';
  import { handleApiError } from '#lib/errorhandling/apiErrorHandling.js';
  import { toast } from 'svelte-sonner';

  interface Props {
    open: boolean;
    token: AdminUserViewApiToken;
    onDeleted: () => void;
  }

  let { open = $bindable<boolean>(), token, onDeleted }: Props = $props();

  function onDeleteClicked() {
    adminDeleteApiToken({ path: { tokenId: token.id } })
      .then(() => {
        onDeleted();
        toast.success('Deleted API token');
      })
      .catch(handleApiError)
      .finally(() => (open = false));
  }
</script>

<ConfirmDeleteDialog bind:open title="Delete API token" onConfirm={onDeleteClicked}>
  {#snippet description()}
    Anything authenticating with <strong>{token.name}</strong> stops working immediately.<br />
    <strong>This action is irreversible.</strong>
  {/snippet}
</ConfirmDeleteDialog>

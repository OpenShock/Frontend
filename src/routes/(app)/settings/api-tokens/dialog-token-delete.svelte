<script lang="ts">
  import { apiTokensApi } from '$lib/api';
  import type { TokenResponse } from '$lib/api/internal/v1';
  import ConfirmDeleteDialog from '$lib/components/ConfirmDeleteDialog.svelte';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
  import { toast } from 'svelte-sonner';

  interface Props {
    open: boolean;
    token: TokenResponse;
    onDeleted: (id: string) => void;
  }

  let { open = $bindable(), token, onDeleted }: Props = $props();

  async function deleteToken() {
    try {
      await apiTokensApi.tokenDeleteDeleteToken(token.id);
      onDeleted(token.id);
      toast.success('Token deleted successfully');
      open = false;
    } catch (error) {
      await handleApiError(error);
    }
  }
</script>

<ConfirmDeleteDialog bind:open title="Delete API token" onConfirm={deleteToken}>
  {#snippet description()}
    Are you sure you want to delete <strong>{token?.name}</strong>?<br />
    This action cannot be undone. This will permanently delete the token.
  {/snippet}
</ConfirmDeleteDialog>

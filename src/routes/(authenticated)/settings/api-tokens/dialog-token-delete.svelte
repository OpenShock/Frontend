<script lang="ts">
  import { apiTokensApi } from '$lib/api';
  import type { TokenResponse } from '$lib/api/internal/v1';
  import Button from '$lib/components/ui/button/button.svelte';
  import * as Dialog from '$lib/components/ui/dialog';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
  import { deleteApiToken } from '$lib/stores/ApiTokensStore';
  import { toast } from 'svelte-sonner';

  interface Props {
    open: boolean;
    token: TokenResponse;
  }

  let { open = $bindable(), token }: Props = $props();

  function deleteToken() {
    apiTokensApi
      .tokenDeleteDeleteToken(token.id)
      .then(() => {
        deleteApiToken(token.id);

        toast.success('Token deleted successfully');

        open = false;
      })
      .catch(handleApiError);
  }
</script>

<Dialog.Root bind:open={() => open, (o) => (open = o)}>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>Are you sure you want to delete <b>{token?.name}</b>?</Dialog.Title>
      <Dialog.Description>
        This action cannot be undone. This will permanently delete the token.
      </Dialog.Description>
    </Dialog.Header>
    <Button variant="destructive" onclick={deleteToken}>Delete</Button>
  </Dialog.Content>
</Dialog.Root>

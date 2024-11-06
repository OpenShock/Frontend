<script lang="ts">
  import { tokensApi } from '$lib/api';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
  import * as Dialog from '$lib/components/ui/dialog';
  import Button from '$lib/components/ui/button/button.svelte';
  import type { ApiToken } from './columns';

  type Props = {
    token: ApiToken | null;
    onDeleted: (id: string) => void;
    onClose: () => void;
  };

  let { token, onDeleted, onClose }: Props = $props();

  function deleteToken() {
    if (!token) return;

    tokensApi
      .tokensDeleteToken(token.id)
      .then(() => onDeleted(token.id))
      .catch(handleApiError);
  }

  function handleOpenChanged(open: boolean) {
    if (!open) {
      onClose();
    }
  }
</script>

<Dialog.Root open={token !== null} onOpenChange={handleOpenChanged} controlledOpen={true}>
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

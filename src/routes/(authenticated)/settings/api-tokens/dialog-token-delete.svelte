<script lang="ts">
  import { tokensApi } from '$lib/api';
  import Button from '$lib/components/ui/button/button.svelte';
  import * as Dialog from '$lib/components/ui/dialog';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
  import { toast } from 'svelte-sonner';
  import type { ApiToken } from './columns';
  import { deleteApiToken } from '$lib/stores/ApiTokensStore';

  type Props = {
    open: boolean;
    token: ApiToken;
  };

  let { open = $bindable(), token }: Props = $props();

  function handleDeleted() {
    deleteApiToken(token.id);
    toast.success('Token deleted successfully');
    open = false;
  }

  function deleteToken() {
    tokensApi.tokensDeleteToken(token.id).then(handleDeleted).catch(handleApiError);
  }
</script>

<Dialog.Root {open} onOpenChange={(o) => (open = o)} controlledOpen={true}>
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

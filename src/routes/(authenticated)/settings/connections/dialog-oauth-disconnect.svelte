<script lang="ts">
  import { accountV1Api } from '$lib/api';
  import { Button } from '$lib/components/ui/button';
  import * as Dialog from '$lib/components/ui/dialog';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';

  interface Props {
    open: boolean;
    providerKey?: string;
    displayName?: string;
    onDisconnected: (providerKey: string) => void;
  }

  let { open = $bindable(), providerKey, displayName, onDisconnected }: Props = $props();
  let busy = $state(false);

  async function doUnlink() {
    if (!providerKey) return;
    busy = true;

    try {
      await accountV1Api.authenticatedAccountRemoveOAuthConnection(providerKey);
      onDisconnected(providerKey);
      open = false;
    } catch (err) {
      await handleApiError(err);
    } finally {
      busy = false;
    }
  }
</script>

<Dialog.Root bind:open={() => open, (o) => (open = o)}>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>Unlink {displayName ?? 'this account'}?</Dialog.Title>
      <Dialog.Description>
        You'll no longer be able to sign in with this provider unless you link it again.
      </Dialog.Description>
    </Dialog.Header>

    <div class="flex justify-end gap-2">
      <Button variant="secondary" onclick={() => (open = false)} disabled={busy}>Cancel</Button>
      <Button variant="destructive" onclick={doUnlink} disabled={busy} aria-busy={busy}>
        Unlink
      </Button>
    </div>
  </Dialog.Content>
</Dialog.Root>

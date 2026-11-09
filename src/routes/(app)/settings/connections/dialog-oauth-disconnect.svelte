<script lang="ts">
  import { m } from '#lib/paraglide/messages.js';
  import { authenticatedAccountRemoveOAuthConnection } from '#lib/api/index.js';
  import { Button } from '@openshock/svelte-core/components/ui/button';
  import * as Dialog from '@openshock/svelte-core/components/ui/dialog';
  import { handleApiError } from '#lib/errorhandling/apiErrorHandling.js';

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
      await authenticatedAccountRemoveOAuthConnection({ path: { provider: providerKey } });
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
      <Dialog.Title
        >{displayName
          ? m.connections_unlink_title({ name: displayName })
          : m.connections_unlink_title_generic()}</Dialog.Title
      >
      <Dialog.Description>
        {m.connections_unlink_desc()}
      </Dialog.Description>
    </Dialog.Header>

    <Dialog.Footer>
      <Button variant="outline" onclick={() => (open = false)} disabled={busy}
        >{m.common_cancel()}</Button
      >
      <Button variant="destructive" onclick={doUnlink} disabled={busy} aria-busy={busy}>
        {m.connections_unlink()}
      </Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>

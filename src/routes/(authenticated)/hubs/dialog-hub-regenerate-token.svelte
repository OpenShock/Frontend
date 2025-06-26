<script lang="ts">
  import { hubManagementV1Api } from '$lib/api';
  import CopyInput from '$lib/components/CopyInput.svelte';
  import { Button } from '$lib/components/ui/button';
  import * as Dialog from '$lib/components/ui/dialog';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
  import type { Hub } from './columns';

  interface Props {
    open: boolean;
    hub: Hub;
  }

  let { open = $bindable<boolean>(), hub }: Props = $props();

  let newToken = $state<string | null>(null);

  async function onSubmit() {
    hubManagementV1Api
      .devicesRegenerateDeviceToken(hub.id)
      .then((token) => (newToken = token))
      .catch(handleApiError);
  }
</script>

<Dialog.Root bind:open={() => open, (o) => (open = o)}>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>Regenerate Token</Dialog.Title>
      <Dialog.Description>
        {#if newToken === null}
          Are you sure you want to regenerate the token for <strong>{hub.name}</strong>?<br />
          This will invalidate the current token and generate a new one. Make sure to update any configurations
          that use the old token.<br />
          <strong>This action is irreversible.</strong>
        {:else}
          The token for <strong>{hub.name}</strong> has been successfully regenerated. Please make sure
          to copy the new token and update any configurations that use it.
        {/if}
      </Dialog.Description>
    </Dialog.Header>
    {#if newToken === null}
      <Button onclick={onSubmit}>Regenerate Token</Button>
    {:else}
      <span class="text-sm text-muted-foreground"> The new token is: </span>
      <CopyInput class="max-w-40" value={newToken} />
      <Button onclick={() => (open = false)}>Close</Button>
    {/if}
  </Dialog.Content>
</Dialog.Root>

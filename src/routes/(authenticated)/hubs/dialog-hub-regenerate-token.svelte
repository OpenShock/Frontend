<script lang="ts">
  import { hubManagementV1Api } from '$lib/api';
  import { Button } from '$lib/components/ui/button';
  import * as Dialog from '$lib/components/ui/dialog';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
  import type { Hub } from './columns';

  interface Props {
    open: boolean;
    hub: Hub;
  }

  let { open = $bindable<boolean>(), hub }: Props = $props();

  let confirmed = $state(false);

  function onSubmit() {
    hubManagementV1Api
      .devicesRegenerateDeviceToken(hub.id)
      .then(() => {
        confirmed = true;
      })
      .catch(handleApiError);
  }
</script>

<Dialog.Root bind:open={() => open, (o) => (open = o)}>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>Regenerate Token</Dialog.Title>
      <Dialog.Description>
        {#if !confirmed}
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
    {#if !confirmed}
      <Button onclick={onSubmit}>Regenerate Token</Button>
    {:else}
      <p class="text-sm text-muted-foreground">New token: {'AAA'}</p>
    {/if}
  </Dialog.Content>
</Dialog.Root>

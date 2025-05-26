<script lang="ts">
  import { adminApi } from '$lib/api';
  import type { WebhookDto } from '$lib/api/internal/v1';
  import Button from '$lib/components/ui/button/button.svelte';
  import * as Dialog from '$lib/components/ui/dialog';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
  import { toast } from 'svelte-sonner';

  interface Props {
    open: boolean;
    webhook: WebhookDto;
  }

  let { open = $bindable<boolean>(), webhook }: Props = $props();

  function onDeleteClicked() {
    adminApi
      .adminRemoveWebhook(webhook.id)
      .then(() => {
        toast.success('Removed webhook');
        open = false;
      })
      .catch(handleApiError)
      .finally(() => (open = false));
  }
</script>

<Dialog.Root bind:open={() => open, (o) => (open = o)}>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>Delete webhook</Dialog.Title>
      <Dialog.Description>
        Are you sure you want to delete <strong>{webhook.name}</strong>?<br />
        <strong>This action is irreversible.</strong>
      </Dialog.Description>
    </Dialog.Header>
    <Button onclick={onDeleteClicked}>Delete</Button>
  </Dialog.Content>
</Dialog.Root>

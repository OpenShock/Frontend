<script lang="ts">
  import { adminApi } from '$lib/api';
  import type { WebhookDto } from '$lib/api/internal/v1';
  import ConfirmDeleteDialog from '$lib/components/ConfirmDeleteDialog.svelte';
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
      })
      .catch(handleApiError)
      .finally(() => (open = false));
  }
</script>

<ConfirmDeleteDialog bind:open title="Delete webhook" onConfirm={onDeleteClicked}>
  {#snippet description()}
    Are you sure you want to delete <strong>{webhook.name}</strong>?<br />
    <strong>This action is irreversible.</strong>
  {/snippet}
</ConfirmDeleteDialog>

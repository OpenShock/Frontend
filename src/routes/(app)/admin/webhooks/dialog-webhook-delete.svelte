<script lang="ts">
  import { adminRemoveWebhook } from '$lib/api';
  import type { WebhookDto } from '$lib/api';
  import ConfirmDeleteDialog from '$core/components/ConfirmDeleteDialog.svelte';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
  import { toast } from 'svelte-sonner';

  interface Props {
    open: boolean;
    webhook: WebhookDto;
  }

  let { open = $bindable<boolean>(), webhook }: Props = $props();

  function onDeleteClicked() {
    adminRemoveWebhook({ path: { id: webhook.id } })
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

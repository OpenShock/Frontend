<script lang="ts">
  import { adminDeleteEmailOutbox, type EmailOutboxMessageDto } from '$lib/api';
  import { ConfirmDeleteDialog } from '@openshock/svelte-core/components/index.js';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
  import { toast } from 'svelte-sonner';

  interface Props {
    open: boolean;
    message: EmailOutboxMessageDto;
    onDeleted?: () => void;
  }

  let { open = $bindable<boolean>(), message, onDeleted }: Props = $props();

  function onDeleteClicked() {
    adminDeleteEmailOutbox({ path: { id: message.id } })
      .then(() => {
        toast.success('Deleted message');
        onDeleted?.();
      })
      .catch(handleApiError)
      .finally(() => (open = false));
  }
</script>

<ConfirmDeleteDialog bind:open title="Delete outbox message" onConfirm={onDeleteClicked}>
  {#snippet description()}
    Are you sure you want to delete the <strong>{message.type}</strong> message to
    <strong>{message.recipient}</strong>?<br />
    <strong>This action is irreversible.</strong>
  {/snippet}
</ConfirmDeleteDialog>

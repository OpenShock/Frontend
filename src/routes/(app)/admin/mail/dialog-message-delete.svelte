<script lang="ts">
  import { adminDeleteEmailOutbox, type EmailOutboxMessageDto } from '#lib/api/index.js';
  import { ConfirmDeleteDialog } from '@openshock/svelte-core/components';
  import { handleApiError } from '#lib/errorhandling/apiErrorHandling.js';
  import { toast } from 'svelte-sonner';

  interface Props {
    open: boolean;
    message: EmailOutboxMessageDto;
    onDeleted?: () => void;
  }

  let { open = $bindable<boolean>(), message, onDeleted }: Props = $props();

  async function onDeleteClicked() {
    try {
      await adminDeleteEmailOutbox({ path: { id: message.id } });
      toast.success('Deleted message');
      onDeleted?.();
    } catch (error) {
      await handleApiError(error);
    }
  }
</script>

<ConfirmDeleteDialog bind:open title="Delete outbox message" onConfirm={onDeleteClicked}>
  {#snippet description()}
    Are you sure you want to delete the <strong>{message.type}</strong> message to
    <strong>{message.recipient}</strong>?<br />
    <strong>This action is irreversible.</strong>
  {/snippet}
</ConfirmDeleteDialog>

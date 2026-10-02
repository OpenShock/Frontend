<script lang="ts">
  import RowActions from '#lib/components/Table/RowActions.svelte';
  import {
    EmailStatus,
    adminCancelEmailOutbox,
    adminRequeueEmailOutbox,
    type EmailOutboxMessageDto,
  } from '#lib/api/index.js';
  import { copyToClipboard } from '@openshock/svelte-core/utils';
  import { Ban, Copy, Eye, RotateCcw, Trash2 } from '@lucide/svelte';
  import { handleApiError } from '#lib/errorhandling/apiErrorHandling.js';
  import { toast } from 'svelte-sonner';
  import MessageDetailsDialog from './dialog-message-details.svelte';
  import MessageDeleteDialog from './dialog-message-delete.svelte';

  interface Props {
    message: EmailOutboxMessageDto;
    onChanged?: () => void;
  }

  let { message, onChanged }: Props = $props();

  let detailsDialogOpen = $state<boolean>(false);
  let deleteDialogOpen = $state<boolean>(false);

  // A terminal message can be re-queued; only a still-pending one can be cancelled.
  let canRequeue = $derived(
    message.status === EmailStatus.Failed ||
      message.status === EmailStatus.Skipped ||
      message.status === EmailStatus.Sent
  );
  let canCancel = $derived(message.status === EmailStatus.Pending);

  const copyId = () => copyToClipboard(message.id, 'ID copied to clipboard');

  function requeue() {
    adminRequeueEmailOutbox({ path: { id: message.id } })
      .then(() => {
        toast.success('Message requeued');
        onChanged?.();
      })
      .catch(handleApiError);
  }

  function cancel() {
    adminCancelEmailOutbox({ path: { id: message.id } })
      .then(() => {
        toast.success('Message cancelled');
        onChanged?.();
      })
      .catch(handleApiError);
  }
</script>

<MessageDetailsDialog bind:open={detailsDialogOpen} {message} />
<MessageDeleteDialog bind:open={deleteDialogOpen} {message} onDeleted={onChanged} />

<RowActions
  label="Message"
  actions={[
    { label: 'View details', icon: Eye, onclick: () => (detailsDialogOpen = true) },
    { label: 'Requeue', icon: RotateCcw, onclick: requeue, disabled: !canRequeue },
    { label: 'Cancel', icon: Ban, onclick: cancel, disabled: !canCancel },
    { label: 'Copy ID', icon: Copy, onclick: copyId, separatorBefore: true },
    {
      label: 'Delete',
      icon: Trash2,
      onclick: () => (deleteDialogOpen = true),
      destructive: true,
      separatorBefore: true,
    },
  ]}
/>

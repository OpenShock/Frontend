<script lang="ts">
  import {
    EmailStatus,
    adminCancelEmailOutbox,
    adminRequeueEmailOutbox,
    type EmailOutboxMessageDto,
  } from '$lib/api';
  import { TableActionMenu } from '@openshock/svelte-core/components';
  import * as DropdownMenu from '@openshock/svelte-core/components/ui/dropdown-menu';
  import { copyToClipboard } from '@openshock/svelte-core/utils/clipboard.svelte.js';
  import { Ban, Copy, Eye, RotateCcw, Trash2 } from '@lucide/svelte';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
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

<TableActionMenu>
  <DropdownMenu.Label>Message</DropdownMenu.Label>
  <DropdownMenu.Group>
    <DropdownMenu.Item class="cursor-pointer" onclick={() => (detailsDialogOpen = true)}>
      <Eye class="size-4" />
      View details
    </DropdownMenu.Item>
    <DropdownMenu.Item
      class={canRequeue ? 'cursor-pointer' : undefined}
      disabled={!canRequeue}
      onclick={requeue}
    >
      <RotateCcw class="size-4" />
      Requeue
    </DropdownMenu.Item>
    <DropdownMenu.Item
      class={canCancel ? 'cursor-pointer' : undefined}
      disabled={!canCancel}
      onclick={cancel}
    >
      <Ban class="size-4" />
      Cancel
    </DropdownMenu.Item>
    <DropdownMenu.Separator />
    <DropdownMenu.Item class="cursor-pointer" onclick={copyId}>
      <Copy class="size-4" />
      Copy ID
    </DropdownMenu.Item>
    <DropdownMenu.Separator />
    <DropdownMenu.Item
      class="cursor-pointer text-red-500"
      onclick={() => (deleteDialogOpen = true)}
    >
      <Trash2 class="size-4" />
      Delete
    </DropdownMenu.Item>
  </DropdownMenu.Group>
</TableActionMenu>

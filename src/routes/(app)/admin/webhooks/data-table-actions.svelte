<script lang="ts">
  import RowActions from '#lib/components/Table/RowActions.svelte';
  import type { WebhookDto } from '#lib/api/index.js';
  import { copyToClipboard } from '@openshock/svelte-core/utils';
  import { Copy, Pencil, Trash2 } from '@lucide/svelte';
  import WebhookDeleteDialog from './dialog-webhook-delete.svelte';

  interface Props {
    webhook: WebhookDto;
  }

  let { webhook }: Props = $props();

  let deleteDialogOpen = $state<boolean>(false);

  const copyId = () => copyToClipboard(webhook.id, 'ID copied to clipboard');
</script>

<WebhookDeleteDialog bind:open={deleteDialogOpen} {webhook} />

<RowActions
  label="Webhook"
  actions={[
    { label: 'Edit', icon: Pencil, disabled: true },
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

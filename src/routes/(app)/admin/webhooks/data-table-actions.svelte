<script lang="ts">
  import { type WebhookDto } from '$lib/api/internal/v1';
  import TableActionMenu from '$lib/components/TableActionMenu.svelte';
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
  import { copyToClipboard } from '$lib/utils/clipboard.svelte';
  import WebhookDeleteDialog from './dialog-webhook-delete.svelte';

  interface Props {
    webhook: WebhookDto;
  }

  let { webhook }: Props = $props();

  let deleteDialogOpen = $state<boolean>(false);

  const copyId = () => copyToClipboard(webhook.id, 'ID copied to clipboard');
</script>

<WebhookDeleteDialog bind:open={deleteDialogOpen} {webhook} />

<TableActionMenu>
  <DropdownMenu.Item onclick={copyId}>Copy ID</DropdownMenu.Item>
  <DropdownMenu.Item>Edit</DropdownMenu.Item>
  <DropdownMenu.Item onclick={() => (deleteDialogOpen = true)}>Delete</DropdownMenu.Item>
</TableActionMenu>

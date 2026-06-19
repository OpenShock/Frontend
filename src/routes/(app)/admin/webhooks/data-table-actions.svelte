<script lang="ts">
  import type { WebhookDto } from '$lib/api';
  import TableActionMenu from '$lib/components/TableActionMenu.svelte';
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
  import { copyToClipboard } from '$lib/utils/clipboard.svelte';
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

<TableActionMenu>
  <DropdownMenu.Label>Webhook</DropdownMenu.Label>
  <DropdownMenu.Group>
    <DropdownMenu.Item class="cursor-pointer">
      <Pencil class="size-4" />
      Edit
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

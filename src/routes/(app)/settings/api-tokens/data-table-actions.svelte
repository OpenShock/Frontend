<script lang="ts">
  import { tokenDeleteDeleteToken, tokensSetTokenPaused } from '$lib/api';
  import type { TokenResponseV2 } from '$lib/api';
  import { dialog } from '$lib/components/dialog-manager/dialog-store.svelte';
  import type { DialogRenderProps } from '$lib/components/dialog-manager/types';
  import TableActionMenu from '$lib/components/TableActionMenu.svelte';
  import { buttonVariants } from '$lib/components/ui/button';
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
  import * as Tooltip from '$lib/components/ui/tooltip';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
  import { cn } from '$lib/utils';
  import { copyToClipboard } from '$lib/utils/clipboard.svelte';
  import Pause from '@lucide/svelte/icons/pause';
  import Play from '@lucide/svelte/icons/play';
  import { Copy, Pencil, Trash2 } from '@lucide/svelte';
  import { toast } from 'svelte-sonner';
  import TokenEditDialog, { type TokenEditResult } from './dialog-token-edit.svelte';

  interface Props {
    token: TokenResponseV2;
    onEdit: (id: string, updater: (token: TokenResponseV2) => TokenResponseV2) => void;
    onDeleted: (id: string) => void;
  }

  let { token, onEdit, onDeleted }: Props = $props();

  const copyId = () => copyToClipboard(token.id, 'ID copied to clipboard');

  async function togglePaused() {
    const paused = !token.shockerControl.paused;
    try {
      const result = await tokensSetTokenPaused({
        path: { tokenId: token.id },
        body: { paused },
      });
      onEdit(token.id, (t) => ({
        ...t,
        shockerControl: { ...t.shockerControl, paused: result.paused },
      }));
      toast.success(result.paused ? 'Token paused' : 'Token resumed');
    } catch (error) {
      await handleApiError(error);
    }
  }

  async function openEditDialog() {
    const result = await dialog.open<void, TokenEditResult | undefined>({
      contentSnippet: editSnippet,
    });
    if (!result) return;
    onEdit(token.id, (t) => ({ ...t, ...result }));
  }

  async function openDeleteDialog() {
    const result = await dialog.confirm({
      title: 'Delete API token',
      confirmButtonText: 'Delete',
      data: token,
      descSnippet: deleteDescSnippet,
    });
    if (!result.confirmed) return;
    try {
      await tokenDeleteDeleteToken({ path: { tokenId: token.id } });
      onDeleted(token.id);
      toast.success('Token deleted successfully');
    } catch (error) {
      await handleApiError(error);
    }
  }
</script>

{#snippet editSnippet(props: DialogRenderProps<void, TokenEditResult | undefined>)}
  <TokenEditDialog {token} resolve={props.resolve} close={props.close} />
{/snippet}

{#snippet deleteDescSnippet(t: TokenResponseV2)}
  Are you sure you want to delete <strong>{t.name}</strong>?<br />
  This action cannot be undone. This will permanently delete the token.
{/snippet}

<div class="flex items-center justify-end gap-1">
  <Tooltip.Root>
    <Tooltip.Trigger
      class={cn('size-9', buttonVariants({ variant: 'ghost', size: 'icon' }))}
      onclick={togglePaused}
    >
      {#if token.shockerControl.paused}
        <Play />
      {:else}
        <Pause />
      {/if}
    </Tooltip.Trigger>
    <Tooltip.Content>
      <p>{token.shockerControl.paused ? 'Resume token' : 'Pause token'}</p>
    </Tooltip.Content>
  </Tooltip.Root>

  <TableActionMenu>
    <DropdownMenu.Label>API Token</DropdownMenu.Label>
    <DropdownMenu.Group>
      <DropdownMenu.Item class="cursor-pointer" onclick={togglePaused}>
        {#if token.shockerControl.paused}
          <Play class="size-4" />
        {:else}
          <Pause class="size-4" />
        {/if}
        {token.shockerControl.paused ? 'Resume' : 'Pause'}
      </DropdownMenu.Item>
      <DropdownMenu.Item class="cursor-pointer" onclick={openEditDialog}>
        <Pencil class="size-4" />
        Edit
      </DropdownMenu.Item>
      <DropdownMenu.Separator />
      <DropdownMenu.Item class="cursor-pointer" onclick={copyId}>
        <Copy class="size-4" />
        Copy ID
      </DropdownMenu.Item>
      <DropdownMenu.Separator />
      <DropdownMenu.Item class="cursor-pointer text-red-500" onclick={openDeleteDialog}>
        <Trash2 class="size-4" />
        Delete
      </DropdownMenu.Item>
    </DropdownMenu.Group>
  </TableActionMenu>
</div>

<script lang="ts">
  import { shockerRemoveShocker } from '$lib/api';
  import type { ShockerResponse } from '$lib/api';
  import { Copy, Ellipsis, Logs, Pencil, Share2, Trash2 } from '@lucide/svelte';
  import { goto } from '$app/navigation';
  import { dialog } from '@openshock/svelte-core/components/dialog-manager';
  import { Button } from '@openshock/svelte-core/components/ui/button';
  import * as DropdownMenu from '@openshock/svelte-core/components/ui/dropdown-menu';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
  import { refreshOwnHubs } from '$lib/state/hubs-state.svelte';
  import { copyToClipboard } from '@openshock/svelte-core/utils/clipboard.svelte.js';
  import { resolve } from '$app/paths';
  import { toast } from 'svelte-sonner';

  interface Props {
    shocker: ShockerResponse;
  }

  let { shocker }: Props = $props();

  function copyId() {
    copyToClipboard(shocker.id, 'ID copied to clipboard');
  }

  function viewLogs() {
    goto(resolve(`/shockers/logs?shockerId=${shocker.id}`));
  }

  function editShocker() {
    goto(resolve(`/shockers/${shocker.id}/edit`));
  }

  function shareShocker() {
    goto(resolve(`/shares/user/outgoing?share=${shocker.id}`));
  }

  async function deleteShocker() {
    const result = await dialog.confirm({
      title: 'Delete Shocker',
      desc: `Are you sure you want to delete "${shocker.name}"? This action cannot be undone.`,
      confirmButtonText: 'Delete',
    });
    if (!result.confirmed) return;
    try {
      await shockerRemoveShocker({ path: { shockerId: shocker.id } });
      toast.success(`Shocker "${shocker.name}" deleted`);
      await refreshOwnHubs();
    } catch (error) {
      handleApiError(error);
    }
  }
</script>

<DropdownMenu.Root>
  <DropdownMenu.Trigger>
    {#snippet child({ props })}
      <Button {...props} variant="ghost" size="icon" class="relative size-8 p-0">
        <span class="sr-only">Open menu</span>
        <Ellipsis class="size-4" />
      </Button>
    {/snippet}
  </DropdownMenu.Trigger>
  <DropdownMenu.Content>
    <DropdownMenu.Label>Shocker</DropdownMenu.Label>
    <DropdownMenu.Group>
      <DropdownMenu.Item class="cursor-pointer" onclick={editShocker}>
        <Pencil class="size-4" />
        Edit
      </DropdownMenu.Item>
      <DropdownMenu.Item class="cursor-pointer" onclick={shareShocker}>
        <Share2 class="size-4" />
        Share
      </DropdownMenu.Item>
      <DropdownMenu.Item class="cursor-pointer" onclick={viewLogs}>
        <Logs class="size-4"></Logs> View Logs</DropdownMenu.Item
      >
      <DropdownMenu.Separator />
      <DropdownMenu.Item class="cursor-pointer" onclick={copyId}>
        <Copy class="size-4" />
        Copy ID
      </DropdownMenu.Item>
      <DropdownMenu.Separator />
      <DropdownMenu.Item class="cursor-pointer text-red-500" onclick={deleteShocker}>
        <Trash2 class="size-4" />
        Delete
      </DropdownMenu.Item>
    </DropdownMenu.Group>
  </DropdownMenu.Content>
</DropdownMenu.Root>

<script lang="ts">
  import { Ellipsis, LoaderCircle, Pause, Pencil, Play, Share2, Trash2 } from '@lucide/svelte';
  import { goto } from '$app/navigation';
  import { shockersV1Api } from '$lib/api';
  import type { ShockerResponse } from '$lib/api/internal/v1';
  import { dialog } from '$lib/components/dialog-manager/dialog-store.svelte';
  import { Button } from '$lib/components/ui/button';
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
  import { refreshOwnHubs } from '$lib/state/hubs-state.svelte';
  import { resolve } from '$app/paths';
  import { toast } from 'svelte-sonner';

  interface Props {
    shocker: ShockerResponse;
  }

  let { shocker }: Props = $props();

  let pauseLoading = $state(false);

  function viewLogs() {
    goto(resolve(`/shockers/logs/${shocker.id}`));
  }

  function editShocker() {
    goto(resolve(`/shockers/${shocker.id}/edit`));
  }

  function shareShocker() {
    goto(`${resolve('/shares/user/outgoing')}?share=${shocker.id}`);
  }

  async function togglePause() {
    pauseLoading = true;
    try {
      const result = await shockersV1Api.shockerPauseShocker(shocker.id, {
        pause: !shocker.isPaused,
      });
      shocker.isPaused = result.data;
      toast.success(shocker.isPaused ? 'Shocker paused' : 'Shocker resumed');
    } catch (error) {
      handleApiError(error);
    } finally {
      pauseLoading = false;
    }
  }

  async function deleteShocker() {
    const result = await dialog.confirm({
      title: 'Delete Shocker',
      desc: `Are you sure you want to delete "${shocker.name}"? This action cannot be undone.`,
      confirmButtonText: 'Delete',
    });
    if (!result.confirmed) return;
    try {
      await shockersV1Api.shockerRemoveShocker(shocker.id);
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
    <DropdownMenu.Item class="cursor-pointer" onclick={togglePause} disabled={pauseLoading}>
      {#if pauseLoading}
        <LoaderCircle class="size-4 animate-spin" />
      {:else if shocker.isPaused}
        <Play class="size-4" />
      {:else}
        <Pause class="size-4" />
      {/if}
      {shocker.isPaused ? 'Resume' : 'Pause'}
    </DropdownMenu.Item>
    <DropdownMenu.Item class="cursor-pointer" onclick={editShocker}>
      <Pencil class="size-4" />
      Edit
    </DropdownMenu.Item>
    <DropdownMenu.Item class="cursor-pointer" onclick={shareShocker}>
      <Share2 class="size-4" />
      Share
    </DropdownMenu.Item>
    <DropdownMenu.Item class="cursor-pointer" onclick={viewLogs}>View Logs</DropdownMenu.Item>
    <DropdownMenu.Separator />
    <DropdownMenu.Item class="cursor-pointer text-red-500" onclick={deleteShocker}>
      <Trash2 class="size-4" />
      Delete
    </DropdownMenu.Item>
  </DropdownMenu.Content>
</DropdownMenu.Root>

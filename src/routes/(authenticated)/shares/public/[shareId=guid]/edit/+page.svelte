<script lang="ts">
  import { Plus, Save } from '@lucide/svelte';
  import { page } from '$app/state';
  import { publicShockerSharesApi } from '$lib/api';
  import type { PublicShareResponse } from '$lib/api/internal/v1';
  import Container from '$lib/components/Container.svelte';
  import LoadingCircle from '$lib/components/svg/LoadingCircle.svelte';
  import { Button } from '$lib/components/ui/button';
  import * as Card from '$lib/components/ui/card';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
  import { refreshOwnHubs } from '$lib/stores/HubsStore';
  import { onMount } from 'svelte';
  import { toast } from 'svelte-sonner';
  import SharedDevice from './SharedDevice.svelte';
  import DialogAddShocker from './dialog-add-shocker.svelte';

  let publicShareRequest = $state<Promise<PublicShareResponse>>(getPublicShare());
  let publicShareData = $state<PublicShareResponse | null>(null);
  let showAddShockerModal = $state(false);
  let isSaving = $state(false);
  let isAddingShockers = $state(false);

  const shareId = $derived(page.params.shareId);

  onMount(() => {
    refreshOwnHubs();
  });

  async function getPublicShare(): Promise<PublicShareResponse> {
    const id = page.params.shareId;
    if (!id) throw new Error('No share ID provided');

    const response = await publicShockerSharesApi.publicGetPublicShare(id);
    if (!response.data) throw new Error('No data received');
    publicShareData = response.data;
    return response.data;
  }

  async function saveChanges() {
    if (!publicShareData || !shareId || isSaving) return;
    isSaving = true;

    try {
      const allShockers = publicShareData.devices?.flatMap((d) => d.shockers) ?? [];

      const updatePromises = allShockers.map((shocker) =>
        publicShockerSharesApi.shareLinksEditShocker(shareId, shocker.id, {
          permissions: shocker.permissions,
          limits: shocker.limits,
        })
      );

      await Promise.all(updatePromises);
      toast.success('Changes saved successfully');
    } catch (error) {
      handleApiError(error);
    } finally {
      isSaving = false;
    }
  }

  async function onAddedShockers(shockers: { id: string; name: string }[]) {
    if (!shareId || isAddingShockers) return;
    showAddShockerModal = false;
    isAddingShockers = true;

    try {
      const addPromises = shockers.map((s) =>
        publicShockerSharesApi.shareLinksAddShocker(shareId, s.id)
      );

      await Promise.all(addPromises);
      toast.success(`Added ${shockers.length} shocker(s) to share`);

      // Refresh the share data to get the updated list
      publicShareRequest = getPublicShare();
    } catch (error) {
      handleApiError(error);
    } finally {
      isAddingShockers = false;
    }
  }

  function onShockerRemoved(shockerId: string) {
    if (!publicShareData?.devices) return;

    // Remove the shocker from local state
    for (const device of publicShareData.devices) {
      const index = device.shockers.findIndex((s) => s.id === shockerId);
      if (index !== -1) {
        device.shockers.splice(index, 1);
        break;
      }
    }

    // Remove empty devices
    publicShareData.devices = publicShareData.devices.filter((d) => d.shockers.length > 0);
  }
</script>

<DialogAddShocker bind:open={showAddShockerModal} {onAddedShockers} />

<Container class="flex h-full flex-col">
  <Card.Header class="w-full">
    <Card.Title class="flex items-center justify-between space-x-2 text-3xl">
      Edit Public Share: {publicShareData?.name ?? 'Loading...'}
      <div class="flex gap-2">
        <Button onclick={() => (showAddShockerModal = true)} disabled={isAddingShockers}>
          <Plus />
          Add Shocker
        </Button>
        <Button onclick={saveChanges} disabled={isSaving}>
          <Save />
          {isSaving ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </Card.Title>
    <Card.Description>
      Configure the shockers and their limits for this public share link.
    </Card.Description>
  </Card.Header>
  <Card.Content class="flex w-full flex-col space-y-4 overflow-auto">
    {#await publicShareRequest}
      <div class="flex h-full w-full items-center justify-center">
        <LoadingCircle />
      </div>
    {:then}
      {#if publicShareData?.devices?.length && shareId}
        {#each publicShareData.devices as device, i (device.id)}
          <SharedDevice {shareId} bind:device={publicShareData.devices[i]} {onShockerRemoved} />
        {/each}
      {:else}
        <div class="text-muted-foreground flex h-32 flex-col items-center justify-center">
          <p>No shockers added to this share yet.</p>
          <p class="text-sm">Click "Add Shocker" to get started.</p>
        </div>
      {/if}
    {:catch error}
      <div class="flex h-full flex-col items-center justify-center">
        <p>Error fetching public share details</p>
        <pre>{error.message}</pre>
      </div>
    {/await}
  </Card.Content>
</Container>

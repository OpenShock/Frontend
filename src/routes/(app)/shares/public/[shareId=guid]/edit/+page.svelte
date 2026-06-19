<script lang="ts">
  import { publicGetPublicShare, shareLinksAddShocker, shareLinksEditShocker } from '$lib/api';
  import type { PublicShareResponse } from '$lib/api';
  import { ExternalLink, Plus, Save } from '@lucide/svelte';
  import { resolve } from '$app/paths';
  import { page } from '$app/state';
  import CopyInput from '$lib/components/CopyInput.svelte';
  import { Spinner } from '$lib/components/ui/spinner';
  import { Button } from '$lib/components/ui/button';
  import * as Avatar from '$lib/components/ui/avatar';
  import * as Tooltip from '$lib/components/ui/tooltip/index.js';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
  import { refreshOwnHubs } from '$lib/state/hubs-state.svelte';
  import { onMount } from 'svelte';
  import { toast } from 'svelte-sonner';
  import SharedDevice from './SharedDevice.svelte';
  import { registerBreadcrumbs } from '$lib/state/breadcrumbs-state.svelte';
  import DialogAddShocker from './dialog-add-shocker.svelte';
  import { getSiteShortURL } from '$lib/utils/url';

  let publicShareRequest = $state<Promise<PublicShareResponse>>(getPublicShare());
  let publicShareData = $state<PublicShareResponse | null>(null);
  let showAddShockerModal = $state(false);
  let isSaving = $state(false);
  let isAddingShockers = $state(false);

  const shareId = $derived(page.params.shareId);
  const publicUrl = $derived(resolve(`/shares/public/${shareId}`));
  const shareUrl = $derived(getSiteShortURL(`/s/${shareId}`));

  registerBreadcrumbs(() => [
    { label: 'Public Shares', href: '/shares/public' },
    { label: publicShareData?.name ?? 'Edit' },
  ]);

  onMount(() => {
    refreshOwnHubs();
  });

  async function getPublicShare(): Promise<PublicShareResponse> {
    const id = page.params.shareId;
    if (!id) throw new Error('No share ID provided');

    const response = await publicGetPublicShare({ path: { publicShareId: id } });
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
        shareLinksEditShocker({
          path: { publicShareId: shareId, shockerId: shocker.id },
          body: { permissions: shocker.permissions, limits: shocker.limits },
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
        shareLinksAddShocker({ path: { publicShareId: shareId, shockerId: s.id } })
      );

      await Promise.all(addPromises);
      toast.success(`Added ${shockers.length} shocker(s) to share`);

      publicShareRequest = getPublicShare();
    } catch (error) {
      handleApiError(error);
    } finally {
      isAddingShockers = false;
    }
  }

  function onShockerRemoved(shockerId: string) {
    if (!publicShareData?.devices) return;

    for (const device of publicShareData.devices) {
      const index = device.shockers.findIndex((s) => s.id === shockerId);
      if (index !== -1) {
        device.shockers.splice(index, 1);
        break;
      }
    }

    publicShareData.devices = publicShareData.devices.filter((d) => d.shockers.length > 0);
  }
</script>

<DialogAddShocker bind:open={showAddShockerModal} {onAddedShockers} />

<div class="m-5 flex h-full w-full flex-col gap-10">
  <div class="grid grid-cols-3 grid-rows-1 items-center gap-4">
    <div class="flex w-full flex-col">
      <h1 class="text-2xl font-bold">
        Public Share: {publicShareData?.name ?? 'Loading...'}
      </h1>
      <p class="text-muted-foreground text-sm">Editing — changes apply when you save.</p>
    </div>

    <div class="flex items-center">
      <CopyInput value={shareUrl.href} displayValue={shareUrl.host + shareUrl.pathname} />
    </div>

    <div class="flex items-center justify-end gap-2">
      <Button variant="outline" href={publicUrl}>
        <ExternalLink />
        View
      </Button>
      <Button
        variant="outline"
        onclick={() => (showAddShockerModal = true)}
        disabled={isAddingShockers}
      >
        <Plus />
        Add Shocker
      </Button>
      <Button onclick={saveChanges} disabled={isSaving}>
        <Save />
        {isSaving ? 'Saving...' : 'Save'}
      </Button>

      {#if publicShareData}
        <Tooltip.Root>
          <Tooltip.Trigger>
            <span
              class="ml-2 flex flex-row items-center rounded-md px-3 py-1.5 outline-1 outline-gray-500"
            >
              <Avatar.Root class="h-8 w-8">
                <Avatar.Image src={publicShareData.author.image} alt="User Avatar" />
                <Avatar.Fallback>
                  {publicShareData.author.name.charAt(0)}
                </Avatar.Fallback>
              </Avatar.Root>
              <p class="ml-3 text-sm">{publicShareData.author.name}</p>
            </span>
          </Tooltip.Trigger>
          <Tooltip.Content>
            <p>Shared by</p>
          </Tooltip.Content>
        </Tooltip.Root>
      {/if}
    </div>
  </div>

  {#await publicShareRequest}
    <div class="flex h-full w-full items-center justify-center">
      <Spinner class="size-8 text-gray-600 dark:text-gray-300" />
    </div>
  {:then}
    {#if publicShareData?.devices?.length && shareId}
      <div class="flex flex-col gap-8">
        {#each publicShareData.devices as device, i (device.id)}
          <SharedDevice {shareId} bind:device={publicShareData.devices[i]} {onShockerRemoved} />
        {/each}
      </div>
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
</div>

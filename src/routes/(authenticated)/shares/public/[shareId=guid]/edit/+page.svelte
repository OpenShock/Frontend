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
  import SharedDevice from './SharedDevice.svelte';
  import DialogAddShocker from './dialog-add-shocker.svelte';

  let publicShareRequest = $state<Promise<PublicShareResponse>>(getPublicShare());
  let publicShareData = $state<PublicShareResponse | null>(null);
  let showAddShockerModal = $state(false);

  async function getPublicShare(): Promise<PublicShareResponse> {
    const shareId = page.params.shareId;
    if (!shareId) throw new Error('No share ID provided');

    const response = await publicShockerSharesApi.publicGetPublicShare(shareId);
    if (!response.data) throw new Error('No data received');
    publicShareData = response.data;
    return response.data;
  }

  async function saveChanges() {}

  function onAddedShockers(shockers: { id: string; name: string }[]) {}
</script>

<DialogAddShocker bind:open={showAddShockerModal} {onAddedShockers} />

<Container class="h-full flex flex-col">
  <Card.Header class="w-full">
    <Card.Title class="flex items-center justify-between space-x-2 text-3xl">
      Edit Public Share: {publicShareData?.name ?? 'Loading...'}
      <div>
        <span>
          <Button onclick={() => (showAddShockerModal = true)}>
            <Plus />
            Add Shocker
          </Button>
          <Button onclick={saveChanges}>
            <Save />
            Save
          </Button>
        </span>
      </div>
    </Card.Title>
    <Card.Description
      >This is a list of all the public shares you own. You can think of them like a link that
      anyone can access.</Card.Description
    >
  </Card.Header>
  <Card.Content class="flex flex-col space-y-4 w-full overflow-auto">
    {#await publicShareRequest}
      <div class="flex justify-center items-center h-full w-full">
        <LoadingCircle />
      </div>
    {:then}
      {#each publicShareData!.devices as device, i}
        <SharedDevice bind:device={publicShareData!.devices![i]} />
      {/each}
    {:catch error}
      <div class="flex flex-col items-center justify-center h-full">
        <p>Error fetching public share details</p>
        <pre>{error.message}</pre>
      </div>
    {/await}
  </Card.Content>
</Container>

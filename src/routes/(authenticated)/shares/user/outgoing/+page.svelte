<script lang="ts">
  import { shockerSharesV2Api } from '$lib/api';
  import type { V2UserShares, } from '$lib/api/internal/v2';
  import * as Table from '$lib/components/ui/table';
  import { toast } from 'svelte-sonner';
  import EditShare from './edit-share.svelte';
  import UserShareItem from './user-share-item.svelte';
  import LoadingCircle from '$lib/components/svg/LoadingCircle.svelte';

  let userShares = $state<V2UserShares>({ outgoing: [], incoming: [] });
  let editShareDrawerOpen = $state(false);
  let editShareDrawerOpenCount = $state(0);
  let editIndex = $state(0);

  let refreshPromise = $state(refreshUserShares())

  async function refreshUserShares() {
    try {
      userShares = await shockerSharesV2Api.sharesGetSharesByUsers();
    } catch (error) {
      toast.error('Failed to fetch user shares');
      console.error(error);
      throw error;
    }
  }

  function openEditDrawer(userShareIndex: number) {
    editIndex = userShareIndex;
    editShareDrawerOpenCount += 1;
    editShareDrawerOpen = true;
  }
</script>

{#key editShareDrawerOpenCount}
  {#if userShares.outgoing[editIndex] !== undefined}
    <EditShare
      bind:userShare={userShares.outgoing[editIndex]}
      bind:editDrawer={editShareDrawerOpen}
    />
  {/if}
{/key}

{#await refreshPromise}
<div class="flex justify-center items-center h-full w-full">
<LoadingCircle />
</div>
{:then fetched}
<div class="rounded-md border overflow-y-auto mb-6">
  <Table.Root>
    <Table.Body>
      {#each userShares.outgoing as userShare, i (userShare.id)}
        <UserShareItem
          bind:userShare={userShares.outgoing[i]}
          onOpenEdit={() => openEditDrawer(i)}
        />
      {/each}
    </Table.Body>
  </Table.Root>
</div>

{:catch error}
  <div class="text-red-500">Failed to load shares: {error.message}</div>
{/await}


<script lang="ts">
  import LoadingCircle from '$lib/components/svg/LoadingCircle.svelte';
  import * as Table from '$lib/components/ui/table';
  import { UserShares, refreshUserShares } from '$lib/stores/UserSharesStore';
  import EditShare from './edit-share.svelte';
  import UserShareItem from './user-share-item.svelte';

  let editShareDrawerOpen = $state(false);
  let editShareDrawerOpenCount = $state(0);
  let editIndex = $state(0);
  let refreshPromise = $state(refreshUserShares());

  function openEditDrawer(userShareIndex: number) {
    editIndex = userShareIndex;
    editShareDrawerOpenCount += 1;
    editShareDrawerOpen = true;
  }
</script>

{#key editShareDrawerOpenCount}
  {#if $UserShares.outgoing[editIndex] !== undefined}
    <EditShare storeIndex={editIndex} bind:editDrawer={editShareDrawerOpen} />
  {/if}
{/key}

{#await refreshPromise}
  <div class="flex h-full w-full items-center justify-center">
    <LoadingCircle />
  </div>
{:then}
  <div class="mb-6 overflow-y-auto rounded-md border">
    <Table.Root>
      <Table.Body>
        {#each $UserShares.outgoing as userShare, i (userShare.id)}
          <UserShareItem storeIndex={i} onOpenEdit={() => openEditDrawer(i)} />
        {/each}
      </Table.Body>
    </Table.Root>
  </div>
{:catch error}
  <div class="text-red-500">Failed to load shares: {error.message}</div>
{/await}

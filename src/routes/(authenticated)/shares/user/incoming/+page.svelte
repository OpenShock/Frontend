<script lang="ts">
  import LoadingCircle from '$lib/components/svg/LoadingCircle.svelte';
  import * as Table from '$lib/components/ui/table';
  import { UserShares, refreshUserShares } from '$lib/stores/UserSharesStore';
  import IncomingShareItem from './incoming-share-item.svelte';
  import ManageShare from './manage-share.svelte';

  let refreshPromise = $state(refreshUserShares());

  let manageShareDrawerOpen = $state(false);
  let manageShareDrawerOpenCount = $state(0);
  let manageIndex = $state(0);

  function openManageDrawer(userShareIndex: number) {
    manageIndex = userShareIndex;
    manageShareDrawerOpenCount += 1;
    manageShareDrawerOpen = true;
  }
</script>

{#key manageShareDrawerOpenCount}
  {#if $UserShares.outgoing[manageIndex] !== undefined}
    <ManageShare storeIndex={manageIndex} bind:editDrawer={manageShareDrawerOpen} />
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
        {#each $UserShares.incoming as incomingShare, i (incomingShare.id)}
          <IncomingShareItem share={incomingShare} onOpenEdit={() => openManageDrawer(i)} />
        {/each}
      </Table.Body>
    </Table.Root>
  </div>
{:catch error}
  <div class="text-red-500">Failed to load outgoing invites: {error.message}</div>
{/await}

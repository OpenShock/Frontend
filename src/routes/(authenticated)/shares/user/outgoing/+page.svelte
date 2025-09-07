<script lang="ts">
  import * as Table from '$lib/components/ui/table';
  import EditShare from './edit-share.svelte';
  import UserShareItem from './user-share-item.svelte';
  import LoadingCircle from '$lib/components/svg/LoadingCircle.svelte';
  import { UserShares, refreshUserShares } from '$lib/stores/UserSharesStore';
  import { onMount } from 'svelte';

  let editShareDrawerOpen = $state(false);
  let editShareDrawerOpenCount = $state(0);
  let editIndex = $state(0);
  let a = $state(0);

  let refreshPromise = $state(refreshUserShares())

  function openEditDrawer(userShareIndex: number) {
    editIndex = userShareIndex;
    editShareDrawerOpenCount += 1;
    editShareDrawerOpen = true;
  }

  onMount(() => {
    UserShares.subscribe((value) => {
      console.log(value);
    }); // logs '0'
  });
</script>

{#key editShareDrawerOpenCount}
  {#if $UserShares.outgoing[editIndex] !== undefined}
    <EditShare
      storeIndex={editIndex}
      bind:editDrawer={editShareDrawerOpen}
    />
  {/if}
{/key}

<button onclick={() => a += 1}>aaa</button>

{#key a}
{#await refreshPromise}
<div class="flex justify-center items-center h-full w-full">
<LoadingCircle />
</div>
{:then fetched}
<div class="rounded-md border overflow-y-auto mb-6">
  <Table.Root>
    <Table.Body>
      {#each $UserShares.outgoing as userShare, i (userShare.id)}
        <UserShareItem 
          storeIndex={i}
          onOpenEdit={() => openEditDrawer(i)}
        />
      {/each}
    </Table.Body>
  </Table.Root>
</div>

{:catch error}
  <div class="text-red-500">Failed to load shares: {error.message}</div>
{/await}
{/key}


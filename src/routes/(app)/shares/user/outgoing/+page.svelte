<script lang="ts">
  import { EmptyState } from '@openshock/svelte-core/components';
  import { Spinner } from '@openshock/svelte-core/ui/spinner';
  import * as Table from '@openshock/svelte-core/ui/table';
  import { registerBreadcrumbs } from '$lib/state/breadcrumbs-state.svelte';
  import { userSharesState, refreshUserShares } from '$lib/state/user-shares-state.svelte';
  import Share2 from '@lucide/svelte/icons/share-2';
  import EditShare from './edit-share.svelte';
  import UserShareItem from './user-share-item.svelte';

  registerBreadcrumbs(() => [{ label: 'Shares' }]);

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
  {#if userSharesState.shares.outgoing[editIndex] !== undefined}
    <EditShare storeIndex={editIndex} bind:editDrawer={editShareDrawerOpen} />
  {/if}
{/key}

{#await refreshPromise}
  <div class="flex h-full w-full items-center justify-center">
    <Spinner class="size-8 text-gray-600 dark:text-gray-300" />
  </div>
{:then}
  {#if userSharesState.shares.outgoing.length === 0}
    <EmptyState
      icon={Share2}
      title="No shared shockers"
      description="You haven't shared any shockers with other users yet."
    />
  {:else}
    <div class="mb-6 overflow-y-auto rounded-md border">
      <Table.Root>
        <Table.Body>
          {#each userSharesState.shares.outgoing as userShare, i (userShare.id)}
            <UserShareItem storeIndex={i} onOpenEdit={() => openEditDrawer(i)} />
          {/each}
        </Table.Body>
      </Table.Root>
    </div>
  {/if}
{:catch error}
  <div class="text-red-500">Failed to load shares: {error.message}</div>
{/await}

<script lang="ts">
  import * as Empty from '$lib/components/ui/empty';
  import { Spinner } from '$lib/components/ui/spinner';
  import * as Table from '$lib/components/ui/table';
  import { registerBreadcrumbs } from '$lib/state/breadcrumbs-state.svelte';
  import { userSharesState, refreshUserShares } from '$lib/state/user-shares-state.svelte';
  import Inbox from '@lucide/svelte/icons/inbox';
  import IncomingShareItem from './incoming-share-item.svelte';
  import ManageShare from './manage-share.svelte';

  registerBreadcrumbs(() => [{ label: 'Shared with Me' }]);

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
  {#if userSharesState.shares.outgoing[manageIndex] !== undefined}
    <ManageShare storeIndex={manageIndex} bind:editDrawer={manageShareDrawerOpen} />
  {/if}
{/key}

{#await refreshPromise}
  <div class="flex h-full w-full items-center justify-center">
    <Spinner class="size-8 text-gray-600 dark:text-gray-300" />
  </div>
{:then}
  {#if userSharesState.shares.incoming.length === 0}
    <Empty.Root class="mb-6 rounded-md border">
      <Empty.Header>
        <Empty.Media variant="icon">
          <Inbox />
        </Empty.Media>
        <Empty.Title>Nothing shared with you</Empty.Title>
        <Empty.Description>No one has shared a shocker with you yet.</Empty.Description>
      </Empty.Header>
    </Empty.Root>
  {:else}
    <div class="mb-6 overflow-y-auto rounded-md border">
      <Table.Root>
        <Table.Body>
          {#each userSharesState.shares.incoming as incomingShare, i (incomingShare.id)}
            <IncomingShareItem share={incomingShare} onOpenEdit={() => openManageDrawer(i)} />
          {/each}
        </Table.Body>
      </Table.Root>
    </div>
  {/if}
{:catch error}
  <div class="text-red-500">Failed to load outgoing invites: {error.message}</div>
{/await}

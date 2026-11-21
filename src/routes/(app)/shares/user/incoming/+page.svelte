<script lang="ts">
  import { m } from '#lib/paraglide/messages.js';
  import { EmptyState } from '@openshock/svelte-core/components';
  import { Spinner } from '@openshock/svelte-core/components/ui/spinner';
  import * as Table from '@openshock/svelte-core/components/ui/table';
  import { registerBreadcrumbs } from '#lib/state/breadcrumbs-state.svelte.js';
  import { userSharesState, refreshUserShares } from '#lib/state/user-shares-state.svelte.js';
  import Inbox from '@lucide/svelte/icons/inbox';
  import IncomingShareItem from './incoming-share-item.svelte';
  import ManageShare from './manage-share.svelte';

  registerBreadcrumbs(() => [{ label: m.user_shares_tab_incoming() }]);

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
    <Spinner class="text-muted-foreground size-8" />
  </div>
{:then}
  {#if userSharesState.shares.incoming.length === 0}
    <EmptyState
      icon={Inbox}
      title={m.incoming_shares_empty_title()}
      description={m.incoming_shares_empty_desc()}
    />
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
  <div class="text-destructive">Failed to load incoming shares: {error.message}</div>
{/await}

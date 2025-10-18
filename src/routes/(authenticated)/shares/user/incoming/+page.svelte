<script lang="ts">
  import LoadingCircle from '$lib/components/svg/LoadingCircle.svelte';
  import * as Table from '$lib/components/ui/table';
  import { UserShares, refreshUserShares } from '$lib/stores/UserSharesStore';
  import IncomingShareItem from './incoming-share-item.svelte';

  let refreshPromise = $state(refreshUserShares());
</script>

{#await refreshPromise}
  <div class="flex justify-center items-center h-full w-full">
    <LoadingCircle />
  </div>
{:then fetched}
  <div class="rounded-md border overflow-y-auto mb-6">
    <Table.Root>
      <Table.Body>
        {#each $UserShares.incoming as incomingShare, i (incomingShare.id)}
          <IncomingShareItem share={incomingShare} />
        {/each}
      </Table.Body>
    </Table.Root>
  </div>
{:catch error}
  <div class="text-red-500">Failed to load outgoing invites: {error.message}</div>
{/await}

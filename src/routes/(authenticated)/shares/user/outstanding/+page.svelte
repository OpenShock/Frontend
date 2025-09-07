<script lang="ts">
  import LoadingCircle from '$lib/components/svg/LoadingCircle.svelte';
  import * as Table from '$lib/components/ui/table';
  import OutstandingShareItem from './outstanding-share-item.svelte';
  import { OutgoingOutstandingInvites, refreshOutgoingInvites } from '$lib/stores/UserSharesStore';

  let outgoingInvitesPromise = $state(refreshOutgoingInvites())

</script>

{#await outgoingInvitesPromise}
<div class="flex justify-center items-center h-full w-full">
<LoadingCircle />
</div>
{:then fetched}
<div class="rounded-md border overflow-y-auto mb-6">
  <Table.Root>
    <Table.Body>
      {#each $OutgoingOutstandingInvites as outgoingInvite, i (outgoingInvite.id)}
        <OutstandingShareItem shareInvite={outgoingInvite} />
      {/each}
    </Table.Body>
  </Table.Root>
</div>

{:catch error}
  <div class="text-red-500">Failed to load outgoing invites: {error.message}</div>
{/await}

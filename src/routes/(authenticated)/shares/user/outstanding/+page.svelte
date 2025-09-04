<script lang="ts">
  import { shockerSharesV2Api } from '$lib/api';
  import type { ShareInviteBaseDetails } from '$lib/api/internal/v2';
  import LoadingCircle from '$lib/components/svg/LoadingCircle.svelte';
  import { toast } from 'svelte-sonner';
  import * as Table from '$lib/components/ui/table';
  import { onMount } from 'svelte';
  import OutstandingShareItem from './outstanding-share-item.svelte';

  let outgoingInvites = $state<ShareInviteBaseDetails[]>([]);
  let outgoingInvitesPromise = $state(refreshOutgoingInvites())

  async function refreshOutgoingInvites() {
    try {
      outgoingInvites = await shockerSharesV2Api.sharesGetOutgoingInvitesList();

    } catch (error) {
      toast.error('Failed to fetch user shares');
      console.error(error);
      throw error;
    }
  }
</script>

{#await outgoingInvitesPromise}
<div class="flex justify-center items-center h-full w-full">
<LoadingCircle />
</div>
{:then fetched}
<div class="rounded-md border overflow-y-auto mb-6">
  <Table.Root>
    <Table.Body>
      {#each outgoingInvites as outgoingInvite, i (outgoingInvite.id)}
        <OutstandingShareItem shareInvite={outgoingInvite} />
      {/each}
    </Table.Body>
  </Table.Root>
</div>

{:catch error}
  <div class="text-red-500">Failed to load outgoing invites: {error.message}</div>
{/await}

<script lang="ts">
  import LoadingCircle from '$lib/components/svg/LoadingCircle.svelte';
  import * as Table from '$lib/components/ui/table';
  import {
    IncomingInvites,
    OutgoingInvites,
    refreshIncomingInvites,
    refreshOutgoingInvites,
  } from '$lib/stores/UserSharesStore';
  import IncomingInviteItem from './incoming-invite-item.svelte';
  import OutgoingInviteItem from './outgoing-invite-item.svelte';

  let outgoingInvitesPromise = $state(refreshOutgoingInvites());
  let incomingInvitesPromise = $state(refreshIncomingInvites());
</script>

<h1 class="text-3xl font-semibold">Outgoing</h1>

{#await outgoingInvitesPromise}
  <div class="flex justify-center items-center h-full w-full">
    <LoadingCircle />
  </div>
{:then fetched}
  <div class="rounded-md border overflow-y-auto mb-6">
    <Table.Root>
      <Table.Body>
        {#each $OutgoingInvites as invite, i (invite.id)}
          <OutgoingInviteItem shareInvite={invite} />
        {/each}
      </Table.Body>
    </Table.Root>
  </div>
{:catch error}
  <div class="text-red-500">Failed to load outgoing invites: {error.message}</div>
{/await}

<h1 class="text-3xl font-semibold">Incoming</h1>

{#await incomingInvitesPromise}
  <div class="flex justify-center items-center h-full w-full">
    <LoadingCircle />
  </div>
{:then fetched}
  <div class="rounded-md border overflow-y-auto mb-6">
    <Table.Root>
      <Table.Body>
        {#each $IncomingInvites as invite, i (invite.id)}
          <IncomingInviteItem shareInvite={invite} />
        {/each}
      </Table.Body>
    </Table.Root>
  </div>
{:catch error}
  <div class="text-red-500">Failed to load incomding invites: {error.message}</div>
{/await}

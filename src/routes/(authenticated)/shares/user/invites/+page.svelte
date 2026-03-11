<script lang="ts">
  import LoadingCircle from '$lib/components/svg/LoadingCircle.svelte';
  import * as Table from '$lib/components/ui/table';
  import {
    userSharesState,
    refreshIncomingInvites,
    refreshOutgoingInvites,
  } from '$lib/state/user-shares-state.svelte';
  import IncomingInviteItem from './incoming-invite-item.svelte';
  import OutgoingInviteItem from './outgoing-invite-item.svelte';

  let outgoingInvitesPromise = $state(refreshOutgoingInvites());
  let incomingInvitesPromise = $state(refreshIncomingInvites());
</script>

<h2 class="text-3xl font-semibold">Outgoing</h2>

{#await outgoingInvitesPromise}
  <div class="flex h-full w-full items-center justify-center">
    <LoadingCircle />
  </div>
{:then}
  <div class="mb-6 overflow-y-auto rounded-md border">
    <Table.Root>
      <Table.Body>
        {#each userSharesState.outgoingInvites as invite (invite.id)}
          <OutgoingInviteItem shareInvite={invite} />
        {/each}
      </Table.Body>
    </Table.Root>
  </div>
{:catch error}
  <div class="text-red-500">Failed to load outgoing invites: {error.message}</div>
{/await}

<h2 class="text-3xl font-semibold">Incoming</h2>

{#await incomingInvitesPromise}
  <div class="flex h-full w-full items-center justify-center">
    <LoadingCircle />
  </div>
{:then}
  <div class="mb-6 overflow-y-auto rounded-md border">
    <Table.Root>
      <Table.Body>
        {#each userSharesState.incomingInvites as invite (invite.id)}
          <IncomingInviteItem shareInvite={invite} />
        {/each}
      </Table.Body>
    </Table.Root>
  </div>
{:catch error}
  <div class="text-red-500">Failed to load incomding invites: {error.message}</div>
{/await}

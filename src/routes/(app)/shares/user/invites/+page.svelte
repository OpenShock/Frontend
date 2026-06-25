<script lang="ts">
  import EmptyState from '$core/components/EmptyState.svelte';
  import { Spinner } from '$hadcn/spinner';
  import * as Table from '$hadcn/table';
  import { registerBreadcrumbs } from '$lib/state/breadcrumbs-state.svelte';
  import {
    userSharesState,
    refreshIncomingInvites,
    refreshOutgoingInvites,
  } from '$lib/state/user-shares-state.svelte';
  import MailPlus from '@lucide/svelte/icons/mail-plus';
  import Mail from '@lucide/svelte/icons/mail';
  import IncomingInviteItem from './incoming-invite-item.svelte';
  import OutgoingInviteItem from './outgoing-invite-item.svelte';

  registerBreadcrumbs(() => [{ label: 'Invites' }]);

  let invitesPromise = $state(Promise.all([refreshOutgoingInvites(), refreshIncomingInvites()]));

  let bothEmpty = $derived(
    userSharesState.outgoingInvites.length === 0 && userSharesState.incomingInvites.length === 0
  );
</script>

{#await invitesPromise}
  <div class="flex h-full w-full items-center justify-center">
    <Spinner class="size-8 text-gray-600 dark:text-gray-300" />
  </div>
{:then}
  {#if bothEmpty}
    <EmptyState
      icon={Mail}
      title="No invites yet"
      description="You have no incoming or outgoing share invites."
    />
  {:else}
    <h2 class="text-3xl font-semibold">Outgoing</h2>
    {#if userSharesState.outgoingInvites.length === 0}
      <EmptyState
        compact
        icon={MailPlus}
        title="No outgoing invites"
        description="You have no outgoing share invites."
        class="mb-6"
      />
    {:else}
      <div class="mb-6 overflow-y-auto rounded-md border">
        <Table.Root>
          <Table.Body>
            {#each userSharesState.outgoingInvites as invite (invite.id)}
              <OutgoingInviteItem shareInvite={invite} />
            {/each}
          </Table.Body>
        </Table.Root>
      </div>
    {/if}

    <h2 class="text-3xl font-semibold">Incoming</h2>
    {#if userSharesState.incomingInvites.length === 0}
      <EmptyState
        compact
        icon={Mail}
        title="No incoming invites"
        description="You have no incoming share invites."
        class="mb-6"
      />
    {:else}
      <div class="mb-6 overflow-y-auto rounded-md border">
        <Table.Root>
          <Table.Body>
            {#each userSharesState.incomingInvites as invite (invite.id)}
              <IncomingInviteItem shareInvite={invite} />
            {/each}
          </Table.Body>
        </Table.Root>
      </div>
    {/if}
  {/if}
{:catch error}
  <div class="text-red-500">Failed to load invites: {error.message}</div>
{/await}

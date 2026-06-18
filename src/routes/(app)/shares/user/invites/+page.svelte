<script lang="ts">
  import * as Empty from '$lib/components/ui/empty';
  import { Spinner } from '$lib/components/ui/spinner';
  import * as Table from '$lib/components/ui/table';
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

  let outgoingInvitesPromise = $state(refreshOutgoingInvites());
  let incomingInvitesPromise = $state(refreshIncomingInvites());
</script>

<h2 class="text-3xl font-semibold">Outgoing</h2>

{#await outgoingInvitesPromise}
  <div class="flex h-full w-full items-center justify-center">
    <Spinner class="size-8 text-gray-600 dark:text-gray-300" />
  </div>
{:then}
  {#if userSharesState.outgoingInvites.length === 0}
    <Empty.Root class="mb-6 rounded-md border">
      <Empty.Header>
        <Empty.Media variant="icon">
          <MailPlus />
        </Empty.Media>
        <Empty.Title>No outgoing invites</Empty.Title>
        <Empty.Description>You have no outgoing share invites.</Empty.Description>
      </Empty.Header>
    </Empty.Root>
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
{:catch error}
  <div class="text-red-500">Failed to load outgoing invites: {error.message}</div>
{/await}

<h2 class="text-3xl font-semibold">Incoming</h2>

{#await incomingInvitesPromise}
  <div class="flex h-full w-full items-center justify-center">
    <Spinner class="size-8 text-gray-600 dark:text-gray-300" />
  </div>
{:then}
  {#if userSharesState.incomingInvites.length === 0}
    <Empty.Root class="mb-6 rounded-md border">
      <Empty.Header>
        <Empty.Media variant="icon">
          <Mail />
        </Empty.Media>
        <Empty.Title>No incoming invites</Empty.Title>
        <Empty.Description>You have no incoming share invites.</Empty.Description>
      </Empty.Header>
    </Empty.Root>
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
{:catch error}
  <div class="text-red-500">Failed to load incoming invites: {error.message}</div>
{/await}

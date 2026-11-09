<script lang="ts">
  import { m } from '#lib/paraglide/messages.js';
  import { EmptyState } from '@openshock/svelte-core/components';
  import { Spinner } from '@openshock/svelte-core/components/ui/spinner';
  import * as Table from '@openshock/svelte-core/components/ui/table';
  import { registerBreadcrumbs } from '#lib/state/breadcrumbs-state.svelte.js';
  import {
    userSharesState,
    refreshIncomingInvites,
    refreshOutgoingInvites,
  } from '#lib/state/user-shares-state.svelte.js';
  import MailPlus from '@lucide/svelte/icons/mail-plus';
  import Mail from '@lucide/svelte/icons/mail';
  import IncomingInviteItem from './incoming-invite-item.svelte';
  import OutgoingInviteItem from './outgoing-invite-item.svelte';

  registerBreadcrumbs(() => [{ label: m.user_shares_tab_invites() }]);

  let invitesPromise = $state(Promise.all([refreshOutgoingInvites(), refreshIncomingInvites()]));

  let bothEmpty = $derived(
    userSharesState.outgoingInvites.length === 0 && userSharesState.incomingInvites.length === 0
  );
</script>

{#await invitesPromise}
  <div class="flex h-full w-full items-center justify-center">
    <Spinner class="text-muted-foreground size-8" />
  </div>
{:then}
  {#if bothEmpty}
    <EmptyState icon={Mail} title={m.invites_empty_title()} description={m.invites_empty_desc()} />
  {:else}
    <h2 class="text-3xl font-semibold">{m.invites_outgoing()}</h2>
    {#if userSharesState.outgoingInvites.length === 0}
      <EmptyState
        compact
        icon={MailPlus}
        title={m.invites_outgoing_empty_title()}
        description={m.invites_outgoing_empty_desc()}
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

    <h2 class="text-3xl font-semibold">{m.invites_incoming()}</h2>
    {#if userSharesState.incomingInvites.length === 0}
      <EmptyState
        compact
        icon={Mail}
        title={m.invites_incoming_empty_title()}
        description={m.invites_incoming_empty_desc()}
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
  <div class="text-destructive">Failed to load invites: {error.message}</div>
{/await}

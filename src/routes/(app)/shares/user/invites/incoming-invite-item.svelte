<script lang="ts">
  import { userSharesDenyIncomingInvite, userSharesRedeemInvite } from '$lib/api';
  import type { ShareInviteBaseDetails } from '$lib/api';
  import { Check, X, Zap } from '@lucide/svelte';
  import PermissionTooltip from '$lib/components/shares/permission-tooltip.svelte';
  import * as Avatar from '@openshock/svelte-core/components/ui/avatar';
  import { Badge } from '@openshock/svelte-core/components/ui/badge';
  import { buttonVariants } from '@openshock/svelte-core/components/ui/button';
  import * as Table from '@openshock/svelte-core/components/ui/table';
  import * as Tooltip from '@openshock/svelte-core/components/ui/tooltip';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
  import { dialog } from '@openshock/svelte-core/components/dialog-manager';
  import { refreshIncomingInvites } from '$lib/state/user-shares-state.svelte';
  import { cn } from '@openshock/svelte-core/utils/shadcn.js';
  import { toast } from 'svelte-sonner';

  interface Props {
    shareInvite: ShareInviteBaseDetails;
  }

  let { shareInvite = $bindable() }: Props = $props();

  async function acceptInvite() {
    try {
      await userSharesRedeemInvite({ path: { inviteId: shareInvite.id } });
      toast.success(`Accepted share invite for ${shareInvite.owner.name}`);
    } catch (error) {
      handleApiError(error);
    } finally {
      refreshIncomingInvites();
    }
  }

  async function denyInviteCall(invite: ShareInviteBaseDetails) {
    try {
      await userSharesDenyIncomingInvite({ path: { inviteId: invite.id } });
      toast.success(`Declined share invite for ${invite.owner.name}`);
    } catch (error) {
      handleApiError(error);
    } finally {
      refreshIncomingInvites();
    }
  }

  async function denyInvite() {
    const result = await dialog.confirm({
      title: 'Deny Invite',
      confirmButtonText: 'Deny',
      data: shareInvite,
      descSnippet: confirmDesc,
    });
    if (result.confirmed) await denyInviteCall(result.data);
  }
</script>

{#snippet confirmDesc(invite: ShareInviteBaseDetails)}
  <p>Are you sure you want to deny <strong>{invite.owner.name}'s</strong> invite?</p>
{/snippet}

<Table.Row>
  <Table.Cell class="flex flex-auto items-center font-medium">
    <Avatar.Root class="h-15 w-15">
      <Avatar.Image src={shareInvite.owner.image} alt="User Avatar" />
      <Avatar.Fallback>
        {shareInvite.owner.name.charAt(0)}
      </Avatar.Fallback>
    </Avatar.Root>
    <p class="ml-4">{shareInvite.owner.name}</p>
  </Table.Cell>
  <Table.Cell class="flex-auto">
    <span
      class="bg-sidebar flex w-max items-center rounded-2xl px-1.5 py-0.5 ring-1 ring-slate-800"
    >
      <Zap size="15" />
      <p class="ml-2 inline-block sm:hidden">{shareInvite.shockers.length}</p>
      <div class="hidden sm:inline-block">
        {#each shareInvite.shockers as shocker (shocker.id)}
          <Tooltip.Root>
            <Tooltip.Trigger>
              <Badge class="ml-2">{shocker.name}</Badge>
            </Tooltip.Trigger>
            <Tooltip.Content>
              <PermissionTooltip permAndLimits={shocker} />
            </Tooltip.Content>
          </Tooltip.Root>
        {/each}
      </div>
    </span>
  </Table.Cell>
  <Table.Cell class="w-0 flex-none">
    <Tooltip.Root>
      <Tooltip.Trigger
        class={cn('mr-4 size-9', buttonVariants({ variant: 'default' }))}
        onclick={acceptInvite}
        aria-label="Accept invite"
      >
        <Check />
      </Tooltip.Trigger>
      <Tooltip.Content>
        <p>Accept Invite</p>
      </Tooltip.Content>
    </Tooltip.Root>

    <Tooltip.Root>
      <Tooltip.Trigger
        class={cn('mr-4 size-9', buttonVariants({ variant: 'destructive' }))}
        onclick={denyInvite}
        aria-label="Deny invite"
      >
        <X />
      </Tooltip.Trigger>
      <Tooltip.Content>
        <p>Deny Invite</p>
      </Tooltip.Content>
    </Tooltip.Root>
  </Table.Cell>
</Table.Row>

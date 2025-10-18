<script lang="ts">
  import { Check, Key, X, Zap } from '@lucide/svelte';
  import { shockerSharesV2Api } from '$lib/api';
  import type { ShareInviteBaseDetails } from '$lib/api/internal/v2';
  import * as Avatar from '$lib/components/ui/avatar';
  import { Badge } from '$lib/components/ui/badge';
  import { Button } from '$lib/components/ui/button';
  import { buttonVariants } from '$lib/components/ui/button/index.js';
  import * as Table from '$lib/components/ui/table';
  import * as Tooltip from '$lib/components/ui/tooltip';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
  import { openConfirmDialog } from '$lib/stores/ConfirmDialogStore';
  import { refreshIncomingInvites, refreshOutgoingInvites } from '$lib/stores/UserSharesStore';
  import { cn } from '$lib/utils';
  import { toast } from 'svelte-sonner';
  import PermissionTooltip from '../permission-tooltip.svelte';

  interface Props {
    shareInvite: ShareInviteBaseDetails;
  }

  let { shareInvite = $bindable() }: Props = $props();

  async function acceptInvite() {
    try {
      await shockerSharesV2Api.userSharesRedeemInvite(shareInvite.id);
      toast.success(`Accepted share invite for ${shareInvite.owner.name}`);
    } catch (error) {
      handleApiError(error);
    } finally {
      refreshIncomingInvites();
    }
  }

  async function denyInviteCall(invite: ShareInviteBaseDetails) {
    try {
      await shockerSharesV2Api.userSharesDenyIncomingInvite(invite.id);
      toast.success(`Declined share invite for ${invite.owner.name}`);
    } catch (error) {
      handleApiError(error);
    } finally {
      refreshIncomingInvites();
    }
  }

  function denyInvite() {
    openConfirmDialog({
      title: 'Deny Invite',
      confirmButtonText: 'Deny',
      data: shareInvite,
      onConfirm: denyInviteCall,
      descSnippet: confirmDesc,
    });
  }
</script>

{#snippet confirmDesc(invite: ShareInviteBaseDetails)}
  <p>Are you sure you want to deny <strong>{invite.owner.name}'s</strong> invite?</p>
{/snippet}

<Table.Row>
  <Table.Cell class="flex items-center font-medium flex-auto">
    <Avatar.Root class="h-15 w-15">
      <Avatar.Image src={shareInvite.owner.image} alt="User Avatar" />
      <Avatar.Fallback>
        {shareInvite.owner.name.charAt(0)}
      </Avatar.Fallback>
    </Avatar.Root>
    <p class="ml-4">{shareInvite.owner.name}</p>
  </Table.Cell>
  <Table.Cell class="flex-auto">
    <Tooltip.Root>
      <Tooltip.Trigger>
        <span
          class="bg-sidebar flex items-center rounded-2xl px-1.5 py-0.5 ring-1 ring-slate-800 w-max"
        >
          <Zap size="15" />
          <p class="ml-2 inline-block sm:hidden">{shareInvite.shockers.length}</p>
          <div class="hidden sm:inline-block">
            {#each shareInvite.shockers as shocker}
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
      </Tooltip.Trigger>
      <Tooltip.Content>
        <p>Shared shockers</p>
      </Tooltip.Content>
    </Tooltip.Root>
  </Table.Cell>
  <Table.Cell class="w-0 flex-none">
    <Tooltip.Root>
      <Tooltip.Trigger class={cn('size-9 mr-4', buttonVariants({ variant: 'default' }))} onclick={acceptInvite}>
        <Check />
      </Tooltip.Trigger>
      <Tooltip.Content>
        <p>Accept Invite</p>
      </Tooltip.Content>
    </Tooltip.Root>

    <Tooltip.Root>
      <Tooltip.Trigger
        class={cn('size-9 mr-4', buttonVariants({ variant: 'destructive' }))}
        onclick={denyInvite}
      >
        <X />
      </Tooltip.Trigger>
      <Tooltip.Content>
        <p>Deny Invite</p>
      </Tooltip.Content>
    </Tooltip.Root>
  </Table.Cell>
</Table.Row>

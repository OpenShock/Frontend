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
  import { refreshOutgoingInvites } from '$lib/stores/UserSharesStore';
  import { cn } from '$lib/utils';
  import { toast } from 'svelte-sonner';
  import PermissionTooltip from '../permission-tooltip.svelte';

  interface Props {
    shareInvite: ShareInviteBaseDetails;
  }

  let { shareInvite = $bindable() }: Props = $props();

  function copyCode() {
    navigator.clipboard.writeText(shareInvite.id);
    toast.success('Code copied to clipboard');
  }

  async function removeInviteCall(invite: ShareInviteBaseDetails) {
    try {
      await shockerSharesV2Api.userSharesDeleteOutgoingInvite(shareInvite.id);
      if (invite.sharedWith) {
        toast.success(`Cancelled invite for ${invite.sharedWith.name} (${invite.id})`);
      } else {
        toast.success(`Cancelled invite ${invite.id}`);
      }
    } catch (error) {
      handleApiError(error);
    } finally {
      refreshOutgoingInvites();
    }
  }

  function removeInvite() {
    openConfirmDialog({
      title: 'Cancel Invite',
      confirmButtonText: 'Cancel',
      data: shareInvite,
      onConfirm: removeInviteCall,
      descSnippet: confirmDesc,
    });
  }
</script>

{#snippet confirmDesc(invite: ShareInviteBaseDetails)}
  {#if invite.sharedWith}
    <p>Are you sure you want to cancel the invite for <strong>{invite.sharedWith.name}</strong>?</p>
  {:else}
    <p>Are you sure you want to cancel the invite with code <strong>{invite.id}</strong>?</p>
  {/if}
{/snippet}

<Table.Row>
  <Table.Cell class="flex items-center font-medium flex-auto">
    {#if shareInvite.sharedWith}
      <Avatar.Root class="h-15 w-15">
        <Avatar.Image src={shareInvite.sharedWith.image} alt="User Avatar" />
        <Avatar.Fallback>
          {shareInvite.sharedWith.name.charAt(0)}
        </Avatar.Fallback>
      </Avatar.Root>
      <p class="ml-4">{shareInvite.sharedWith.name}</p>
    {:else}
      <Avatar.Root class="h-15 w-15">
        <Avatar.Fallback>CODE</Avatar.Fallback>
      </Avatar.Root>
      <Badge class="ml-4 cursor-pointer" onclick={copyCode} variant="outline">
        <span
          class="flex items-center gap-2 transition duration-150 ease-in-out not-hover:blur-[4px]"
        >
          <Key class="size-3" />
          {shareInvite.id}
        </span>
      </Badge>
    {/if}
  </Table.Cell>
  <Table.Cell class="flex-auto">
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
  </Table.Cell>
  <Table.Cell class="w-0 flex-none">
    <Tooltip.Root>
      <Tooltip.Trigger
        class={cn('size-9 mr-4', buttonVariants({ variant: 'destructive' }))}
        onclick={removeInvite}
      >
        <X />
      </Tooltip.Trigger>
      <Tooltip.Content>
        <p>Cancel Outstanding Invite</p>
      </Tooltip.Content>
    </Tooltip.Root>
  </Table.Cell>
</Table.Row>

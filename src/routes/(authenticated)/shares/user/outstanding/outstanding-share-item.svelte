<script lang="ts">
  import { Key, X, Zap } from '@lucide/svelte';
  import type { ShareInviteBaseDetails } from '$lib/api/internal/v2';
  import * as Avatar from '$lib/components/ui/avatar';
  import { Badge } from '$lib/components/ui/badge';
  import { Button } from '$lib/components/ui/button';
  import * as Table from '$lib/components/ui/table';
  import * as Tooltip from '$lib/components/ui/tooltip';
  import { toast } from 'svelte-sonner';
  import { openConfirmDialog } from '$lib/stores/ConfirmDialogStore';
  import { createRawSnippet, type Snippet } from 'svelte';
  import { shockerSharesV2Api } from '$lib/api';

  interface Props {
    shareInvite: ShareInviteBaseDetails;
  }

  let { shareInvite = $bindable() }: Props = $props();

  function copyCode() {
    navigator.clipboard.writeText(shareInvite.id);
    toast.success('Code copied to clipboard');
  }

  function removeInviteCall(value: ShareInviteBaseDetails) {
    shockerSharesV2Api.sharesDeleteOutgoingInvite(shareInvite.id).then(() => {
      toast.success(`Removed invite ${value.id}`);
    });
  }

  function removeInvite() {
    openConfirmDialog({
      title: 'Remove Invite',
      confirmButtonText: 'Remove',
      data: shareInvite,
      onConfirm: removeInviteCall,
      descSnippet: confirmDesc
    });
  }
</script>

{#snippet confirmDesc(invite: ShareInviteBaseDetails)}
  {#if invite.sharedWith}
    <p>Are you sure you want to remove the invite for <strong>{invite.sharedWith.name}</strong>?</p>
  {:else}
    <p>Are you sure you want to remove the invite with code <strong>{invite.id}</strong>?</p>
  {/if}
{/snippet}

<Table.Row>
  <Table.Cell class="flex items-center font-medium">
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
        <span class="flex items-center gap-2 transition duration-150 ease-in-out not-hover:blur-[4px]">
        <Key class="size-3" />
        {shareInvite.id}
        </span>
      </Badge>
    {/if}
  </Table.Cell>
  <Table.Cell>
    <Tooltip.Root>
      <Tooltip.Trigger>
        <span class="bg-sidebar flex items-center rounded-2xl px-1.5 py-0.5 ring-1 ring-slate-800">
          <Zap size="15" />
          <p class="ml-2 inline-block sm:hidden">{shareInvite.shockers.length}</p>
          <div class="hidden sm:inline-block">
            {#each shareInvite.shockers as shocker}
              <Badge class="ml-2">{shocker.id}</Badge>
            {/each}
          </div>
        </span>
      </Tooltip.Trigger>
      <Tooltip.Content>
        <p>Shared shockers</p>
      </Tooltip.Content>
    </Tooltip.Root>
  </Table.Cell>
  <Table.Cell>
    <Button class="size-9" onclick={removeInvite}>
      <X />
    </Button>
  </Table.Cell>
</Table.Row>

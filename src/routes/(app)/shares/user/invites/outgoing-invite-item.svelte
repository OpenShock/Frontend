<script lang="ts">
  import { m } from '#lib/paraglide/messages.js';
  import { ParaglideMessage } from '@inlang/paraglide-js-svelte';
  import { userSharesDeleteOutgoingInvite } from '#lib/api/index.js';
  import type { ShareInviteBaseDetails } from '#lib/api/index.js';
  import { Key, X, Zap } from '@lucide/svelte';
  import PermissionTooltip from '#lib/components/shares/permission-tooltip.svelte';
  import * as Avatar from '@openshock/svelte-core/components/ui/avatar';
  import { Badge } from '@openshock/svelte-core/components/ui/badge';
  import { buttonVariants } from '@openshock/svelte-core/components/ui/button';
  import * as Table from '@openshock/svelte-core/components/ui/table';
  import * as Tooltip from '@openshock/svelte-core/components/ui/tooltip';
  import { handleApiError } from '#lib/errorhandling/apiErrorHandling.js';
  import { dialog } from '@openshock/svelte-core/components/dialog-manager';
  import { refreshOutgoingInvites } from '#lib/state/user-shares-state.svelte.js';
  import { cn, copyToClipboard } from '@openshock/svelte-core/utils';
  import { toast } from 'svelte-sonner';

  interface Props {
    shareInvite: ShareInviteBaseDetails;
  }

  let { shareInvite = $bindable() }: Props = $props();

  const copyCode = () => copyToClipboard(shareInvite.id, m.common_copied());

  async function removeInviteCall(invite: ShareInviteBaseDetails) {
    try {
      await userSharesDeleteOutgoingInvite({ path: { inviteId: shareInvite.id } });
      if (invite.sharedWith) {
        toast.success(
          m.invite_toast_cancelled_for({ name: invite.sharedWith.name, id: invite.id })
        );
      } else {
        toast.success(m.invite_toast_cancelled({ id: invite.id }));
      }
    } catch (error) {
      handleApiError(error);
    } finally {
      refreshOutgoingInvites();
    }
  }

  async function removeInvite() {
    const result = await dialog.confirm({
      title: m.invite_cancel_title(),
      confirmButtonText: m.invite_cancel(),
      data: shareInvite,
      descSnippet: confirmDesc,
    });
    if (result.confirmed) await removeInviteCall(result.data);
  }
</script>

{#snippet confirmDesc(invite: ShareInviteBaseDetails)}
  {#if invite.sharedWith}
    <p>
      <ParaglideMessage
        message={m.invite_cancel_for_desc}
        inputs={{ name: invite.sharedWith.name }}
      >
        {#snippet strong({ children })}<strong>{@render children?.()}</strong>{/snippet}
      </ParaglideMessage>
    </p>
  {:else}
    <p>
      <ParaglideMessage message={m.invite_cancel_code_desc} inputs={{ code: invite.id }}>
        {#snippet strong({ children })}<strong>{@render children?.()}</strong>{/snippet}
      </ParaglideMessage>
    </p>
  {/if}
{/snippet}

<Table.Row>
  <Table.Cell class="flex flex-auto items-center font-medium">
    {#if shareInvite.sharedWith}
      <Avatar.Root class="h-15 w-15">
        <Avatar.Image src={shareInvite.sharedWith.image} alt={m.common_user_avatar()} />
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
    <span class="bg-sidebar ring-border flex w-max items-center rounded-2xl px-1.5 py-0.5 ring-1">
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
        class={cn('mr-4 size-9', buttonVariants({ variant: 'destructive' }))}
        onclick={removeInvite}
        aria-label={m.invite_cancel_title()}
      >
        <X />
      </Tooltip.Trigger>
      <Tooltip.Content>
        <p>{m.invite_cancel_outstanding()}</p>
      </Tooltip.Content>
    </Tooltip.Root>
  </Table.Cell>
</Table.Row>

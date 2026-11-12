<script lang="ts">
  import { m } from '#lib/paraglide/messages.js';
  import { ParaglideMessage } from '@inlang/paraglide-js-svelte';
  import { userSharesDenyIncomingInvite, userSharesRedeemInvite } from '#lib/api/index.js';
  import type { ShareInviteBaseDetails } from '#lib/api/index.js';
  import { Check, X, Zap } from '@lucide/svelte';
  import PermissionTooltip from '#lib/components/shares/permission-tooltip.svelte';
  import * as Avatar from '@openshock/svelte-core/components/ui/avatar';
  import { Badge } from '@openshock/svelte-core/components/ui/badge';
  import { buttonVariants } from '@openshock/svelte-core/components/ui/button';
  import * as Table from '@openshock/svelte-core/components/ui/table';
  import * as Tooltip from '@openshock/svelte-core/components/ui/tooltip';
  import { handleApiError } from '#lib/errorhandling/apiErrorHandling.js';
  import { dialog } from '@openshock/svelte-core/components/dialog-manager';
  import { refreshIncomingInvites } from '#lib/state/user-shares-state.svelte.js';
  import { cn } from '@openshock/svelte-core/utils';
  import { toast } from 'svelte-sonner';

  interface Props {
    shareInvite: ShareInviteBaseDetails;
  }

  let { shareInvite = $bindable() }: Props = $props();

  async function acceptInvite() {
    try {
      await userSharesRedeemInvite({ path: { inviteId: shareInvite.id } });
      toast.success(m.invite_toast_accepted({ name: shareInvite.owner.name }));
    } catch (error) {
      handleApiError(error);
    } finally {
      refreshIncomingInvites();
    }
  }

  async function denyInviteCall(invite: ShareInviteBaseDetails) {
    try {
      await userSharesDenyIncomingInvite({ path: { inviteId: invite.id } });
      toast.success(m.invite_toast_declined({ name: invite.owner.name }));
    } catch (error) {
      handleApiError(error);
    } finally {
      refreshIncomingInvites();
    }
  }

  async function denyInvite() {
    const result = await dialog.confirm({
      title: m.invite_deny_title(),
      confirmButtonText: m.invite_deny(),
      data: shareInvite,
      descSnippet: confirmDesc,
    });
    if (result.confirmed) await denyInviteCall(result.data);
  }
</script>

{#snippet confirmDesc(invite: ShareInviteBaseDetails)}
  <p>
    <ParaglideMessage message={m.invite_deny_desc} inputs={{ name: invite.owner.name }}>
      {#snippet strong({ children })}<strong>{@render children?.()}</strong>{/snippet}
    </ParaglideMessage>
  </p>
{/snippet}

<Table.Row>
  <Table.Cell class="flex flex-auto items-center font-medium">
    <Avatar.Root class="h-15 w-15">
      <Avatar.Image src={shareInvite.owner.image} alt={m.common_user_avatar()} />
      <Avatar.Fallback>
        {shareInvite.owner.name.charAt(0)}
      </Avatar.Fallback>
    </Avatar.Root>
    <p class="ml-4">{shareInvite.owner.name}</p>
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
        class={cn('mr-4 size-9', buttonVariants({ variant: 'default' }))}
        onclick={acceptInvite}
        aria-label={m.invite_accept()}
      >
        <Check />
      </Tooltip.Trigger>
      <Tooltip.Content>
        <p>{m.invite_accept()}</p>
      </Tooltip.Content>
    </Tooltip.Root>

    <Tooltip.Root>
      <Tooltip.Trigger
        class={cn('mr-4 size-9', buttonVariants({ variant: 'destructive' }))}
        onclick={denyInvite}
        aria-label={m.invite_deny_label()}
      >
        <X />
      </Tooltip.Trigger>
      <Tooltip.Content>
        <p>{m.invite_deny_label()}</p>
      </Tooltip.Content>
    </Tooltip.Root>
  </Table.Cell>
</Table.Row>

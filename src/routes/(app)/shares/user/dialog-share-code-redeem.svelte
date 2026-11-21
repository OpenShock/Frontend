<script lang="ts">
  import { m } from '#lib/paraglide/messages.js';
  import { userSharesRedeemInvite } from '#lib/api/index.js';
  import type { V2UserSharesListItem } from '#lib/api/index.js';
  import { Barcode, Zap } from '@lucide/svelte';
  import * as Avatar from '@openshock/svelte-core/components/ui/avatar';
  import { Badge } from '@openshock/svelte-core/components/ui/badge';
  import { Button } from '@openshock/svelte-core/components/ui/button';
  import * as Dialog from '@openshock/svelte-core/components/ui/dialog';
  import { Input } from '@openshock/svelte-core/components/ui/input';
  import * as Tooltip from '@openshock/svelte-core/components/ui/tooltip';
  import { handleApiError } from '#lib/errorhandling/apiErrorHandling.js';
  import {
    refreshOutgoingInvites,
    refreshUserShares,
  } from '#lib/state/user-shares-state.svelte.js';

  interface Props {
    open: boolean;
    userInput: string;
  }

  let { open = $bindable(), userInput = $bindable() }: Props = $props();
  let redeeming = $state(false);
  let result = $state<V2UserSharesListItem | null>(null);
  // Bumped on close so a request that finishes after dismissal cannot write into the next opening.
  let generation = 0;

  function onOpenChange(o: boolean) {
    if (!o) {
      generation++;
      userInput = '';
      result = null;
      redeeming = false;
    }
    open = o;
  }

  async function onFormSubmit(event: SubmitEvent) {
    event.preventDefault();
    const inviteId = userInput.trim();
    if (redeeming || !inviteId) return;
    redeeming = true;
    const current = generation;
    try {
      const redeemed = await userSharesRedeemInvite({ path: { inviteId } });
      if (current === generation) result = redeemed;
      await refreshUserShares();
    } catch (error) {
      await handleApiError(error);
    } finally {
      if (current === generation) redeeming = false;
      refreshOutgoingInvites();
    }
  }
</script>

<Dialog.Root bind:open={() => open, onOpenChange}>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>{m.share_code_redeem_title()}</Dialog.Title>
      <Dialog.Description>{m.share_code_redeem_desc()}</Dialog.Description>
    </Dialog.Header>

    <form class="min-w-0 space-y-4" onsubmit={onFormSubmit}>
      <Input
        bind:value={userInput}
        disabled={redeeming || result !== null}
        placeholder={m.share_code_redeem_placeholder()}
      />

      {#if result}
        <div class="flex flex-col gap-2">
          <p class="text-success">{m.share_code_redeemed()}</p>

          <span class="flex items-center gap-2">
            <Avatar.Root class="h-15 w-15">
              <Avatar.Image src={result.image} alt={m.common_user_avatar()} />
              <Avatar.Fallback>{result.name.charAt(0)}</Avatar.Fallback>
            </Avatar.Root>
            <p class="ml-4">{result.name}</p>
          </span>

          <span
            class="bg-sidebar ring-border flex h-[26px] items-center rounded-2xl px-1.5 py-0.5 ring-1"
          >
            <Zap size="15" />
            <p class="ml-2 inline-block sm:hidden">{result.shares.length}</p>
            <div class="hidden sm:inline-block">
              {#each result.shares as share (share.id)}
                <Tooltip.Root>
                  <Tooltip.Trigger class="flex items-center">
                    <Badge class="ml-2" variant={share.paused ? 'destructive' : 'default'}
                      >{share.name}</Badge
                    >
                  </Tooltip.Trigger>
                  <Tooltip.Content>
                    <p>{m.share_code_shared_shockers()}</p>
                  </Tooltip.Content>
                </Tooltip.Root>
              {/each}
            </div>
          </span>
        </div>
      {:else}
        <Button
          type="submit"
          class="flex w-full items-center"
          disabled={redeeming || !userInput.trim()}
        >
          <Barcode />
          {redeeming ? m.share_code_redeeming() : m.share_code_redeem()}
        </Button>
      {/if}
    </form>
  </Dialog.Content>
</Dialog.Root>

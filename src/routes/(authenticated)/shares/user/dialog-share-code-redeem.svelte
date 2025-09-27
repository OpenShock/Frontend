<script lang="ts">
  import { Barcode, Code, User, Zap } from '@lucide/svelte';
  import { shockerSharesV2Api } from '$lib/api';
  import type { V2UserSharesListItem } from '$lib/api/internal/v2';
  import * as Avatar from '$lib/components/ui/avatar';
  import Badge from '$lib/components/ui/badge/badge.svelte';
  import Button from '$lib/components/ui/button/button.svelte';
  import * as Dialog from '$lib/components/ui/dialog';
  import { Input } from '$lib/components/ui/input';
  import * as Tooltip from '$lib/components/ui/tooltip';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
  import { refreshOutgoingInvites, refreshUserShares } from '$lib/stores/UserSharesStore';

  interface Props {
    open: boolean;
  }

  let { open = $bindable() }: Props = $props();
  let userInput = $state<string>('');
  let redeemPromise = $state<Promise<V2UserSharesListItem> | null>(null);
  let redeemed = $state<boolean>(false);

  function onOpenChange(o: boolean) {
    if (!o) {
      userInput = '';
      redeemPromise = null;
      redeemed = false;
    }
    open = o;
  }

  async function onFormSubmit() {
    try {
      redeemPromise = shockerSharesV2Api.sharesRedeemInvite(userInput);
      await redeemPromise;
      redeemed = true;
      await refreshUserShares();
    } catch (error) {
      await handleApiError(error);
    } finally {
      refreshOutgoingInvites();
    }
  }
</script>

<Dialog.Root bind:open={() => open, onOpenChange}>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>Redeem Share Code</Dialog.Title>
      <Dialog.Description>Enter the share code to redeem</Dialog.Description>
    </Dialog.Header>

    <form class="modal-form border-surface-500 rounded-container-token space-y-4 min-w-0">
      <Input
        bind:value={userInput}
        disabled={redeemPromise !== null}
        placeholder="Enter share code"
      />

      {#if redeemPromise}
        {#await redeemPromise}
          <p>Redeeming...</p>
        {:then result}
          <div class="flex flex-col gap-2">
            <p class="text-green-500">Redeemed successfully!</p>

            <span class="flex gap-2 items-center">
              <Avatar.Root class="h-15 w-15">
                <Avatar.Image src={result.image} alt="User Avatar" />
                <Avatar.Fallback>{result.name.charAt(0)}</Avatar.Fallback>
              </Avatar.Root>
              <p class="ml-4">{result.name}</p>
            </span>

            <span
              class="bg-sidebar flex items-center rounded-2xl px-1.5 py-0.5 ring-1 ring-slate-800 h-[26px]"
            >
              <Zap size="15" />
              <p class="ml-2 inline-block sm:hidden">{result.shares.length}</p>
              <div class="hidden sm:inline-block">
                {#each result.shares as share}
                  <Tooltip.Root>
                    <Tooltip.Trigger class="flex items-center">
                      <Badge class="ml-2" variant={share.paused ? 'destructive' : 'default'}
                        >{share.name}</Badge
                      >
                    </Tooltip.Trigger>
                    <Tooltip.Content>
                      <p>Shared shockers</p>
                    </Tooltip.Content>
                  </Tooltip.Root>
                {/each}
              </div>
            </span>
          </div>
        {:catch error}
          <p class="text-red-500">Error redeeming code: {error.message}</p>
        {/await}
      {:else}
        <Button
          onclick={onFormSubmit}
          class="flex items-center w-full"
          disabled={redeemPromise !== null}
        >
          <Barcode />
          Redeem
        </Button>
      {/if}
    </form>
  </Dialog.Content>
</Dialog.Root>

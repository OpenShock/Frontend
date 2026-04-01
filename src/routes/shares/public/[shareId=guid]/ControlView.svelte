<script lang="ts">
  import { HubConnectionState } from '@microsoft/signalr';
  import type { PublicShareResponse } from '$lib/api/internal/v1';
  import PublicShareClassicControlModule from '$lib/components/ControlModules/PublicShareClassicControlModule.svelte';
  import * as Avatar from '$lib/components/ui/avatar';
  import * as Tooltip from '$lib/components/ui/tooltip/index.js';
  import { ShareLinkSignalr } from '$lib/signalr/sharelink.svelte';
  import type { Control } from '$lib/signalr/models/Control';
  import { onMount, untrack } from 'svelte';
  import { page } from '$app/state';
  import CopyInput from '$lib/components/CopyInput.svelte';
  import { getSiteShortURL } from '$lib/utils/url';
  import { Button } from '$lib/components/ui/button';
  import { Pencil } from '@lucide/svelte';
  import { userState } from '$lib/state/user-state.svelte';
  import { resolve } from '$app/paths';

  interface Props {
    shareLinkRoot: PublicShareResponse;
    guestName: string | null;
  }

  const { shareLinkRoot, guestName }: Props = $props();

  const shareLinkSignalr = untrack(() => new ShareLinkSignalr(shareLinkRoot.id, guestName));

  onMount(() => {
    shareLinkSignalr.initializeSignalR();

    return () => {
      shareLinkSignalr.destroySignalR();
    };
  });

  function control(control: Control) {
    shareLinkSignalr.control([control]);
  }

  const shareId = $derived(page.params.shareId);

  let editUrl = $derived(resolve(`/shares/public/${shareId}/edit`));
  const shareUrl = $derived(getSiteShortURL(`/s/${shareId}`));
</script>

<div class="m-5 flex h-full w-full flex-col gap-15">
  <div class="grid grid-cols-3 grid-rows-1">
    <div class="flex w-full flex-col">
      <h1 class="text-2xl font-bold">Public Share: {shareLinkRoot.name}</h1>
      <p
        class={shareLinkSignalr.getState() === HubConnectionState.Connected
          ? 'text-green-500'
          : 'text-red-500'}
      >
        {shareLinkSignalr.getState()}
      </p>
    </div>

    <div class="items-center1 flex">
      <CopyInput value={shareUrl.href} displayValue={shareUrl.host + shareUrl.pathname} />
    </div>

    <div class="flex items-center justify-end gap-4">
      {#if userState.self?.id === shareLinkRoot.author.id}
        <Button variant="outline" href={editUrl}><Pencil /> Edit</Button>
      {/if}

      <Tooltip.Provider>
        <Tooltip.Root delayDuration={250}>
          <Tooltip.Trigger>
            <span
              class="mr-10 flex flex-row items-center rounded-md px-4 py-2 outline-1 outline-gray-500"
            >
              <Avatar.Root class="h-10 w-10">
                <Avatar.Image src={shareLinkRoot.author.image} alt="User Avatar" />
                <Avatar.Fallback>
                  {shareLinkRoot.author.name.charAt(0)}
                </Avatar.Fallback>
              </Avatar.Root>
              <p class="ml-4">{shareLinkRoot.author.name}</p>
            </span>
          </Tooltip.Trigger>
          <Tooltip.Content>
            <p>Shared by</p>
          </Tooltip.Content>
        </Tooltip.Root>
      </Tooltip.Provider>
    </div>
  </div>

  <div class="flex flex-row justify-center gap-5">
    {#each shareLinkRoot.devices!.flatMap((device) => device.shockers) as shocker (shocker.id)}
      <PublicShareClassicControlModule {shocker} {control} />
    {/each}
  </div>
</div>

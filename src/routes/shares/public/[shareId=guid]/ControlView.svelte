<script lang="ts">
  import { HubConnectionState } from '@microsoft/signalr';
  import type { PublicShareResponse } from '$lib/api/internal/v1';
  import PublicShareClassicControlModule from '$lib/components/ControlModules/PublicShareClassicControlModule.svelte';
  import * as Avatar from '$lib/components/ui/avatar';
  import * as Tooltip from '$lib/components/ui/tooltip/index.js';
  import { ShareLinkSignalr } from '$lib/sharelink-signalr/index.svelte';
  import type { Control } from '$lib/signalr/models/Control';
  import { onMount, untrack } from 'svelte';

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
</script>

<div class="flex flex-col gap-15 w-full h-full m-5">
  <div class="flex flex-row w-full content-between">
    <div class="flex flex-col w-full">
      <h1 class="text-2xl font-bold">Public Share: {shareLinkRoot.name}</h1>
      <p
        class={shareLinkSignalr.getState() === HubConnectionState.Connected
          ? 'text-green-500'
          : 'text-red-500'}
      >
        {shareLinkSignalr.getState()}
      </p>
    </div>

    <Tooltip.Provider>
      <Tooltip.Root delayDuration={250}>
        <Tooltip.Trigger>
          <span
            class="flex flex-row items-center mr-10 rounded-md py-2 px-4 outline-1 outline-gray-500"
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

  <div class="flex flex-row gap-5 justify-center">
    {#each shareLinkRoot.devices!.flatMap((device) => device.shockers) as shocker (shocker.id)}
      <PublicShareClassicControlModule {shocker} {control} />
    {/each}
  </div>
</div>

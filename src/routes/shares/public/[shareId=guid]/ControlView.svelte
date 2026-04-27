<script lang="ts">
  import { HubConnectionState } from '@microsoft/signalr';
  import type { PublicShareResponse } from '$lib/api/internal/v1';
  import ClassicControlModule from '$lib/components/ControlModules/ClassicControlModule.svelte';
  import LiveButton from '$lib/components/ControlModules/LiveButton.svelte';
  import LiveControlModule from '$lib/components/ControlModules/LiveControlModule.svelte';
  import ShockerCard from '$lib/components/ControlModules/ShockerCard.svelte';
  import { getPauseReason } from '$lib/utils';
  import * as Avatar from '$lib/components/ui/avatar';
  import * as Tooltip from '$lib/components/ui/tooltip/index.js';
  import { ShareLinkSignalr } from '$lib/signalr/sharelink.svelte';
  import type { Control } from '$lib/signalr/models/Control';
  import { ControlType } from '$lib/signalr/models/ControlType';
  import {
    ensureLiveConnection,
    getLiveConnection,
    liveConnections,
    LiveConnectionState,
  } from '$lib/state/live-control-state.svelte';
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

  function publicCtrl(id: string, type: ControlType, intensity: number, duration: number) {
    control({ id, type, intensity, duration: duration * 1000 });
  }

  const shareId = $derived(page.params.shareId);

  let editUrl = $derived(resolve(`/shares/public/${shareId}/edit`));
  const shareUrl = $derived(getSiteShortURL(`/s/${shareId}`));

  // Flatten devices+shockers while keeping the deviceId
  const flatShockers = $derived(
    (shareLinkRoot.devices ?? []).flatMap((device) =>
      device.shockers.map((shocker) => ({ shocker, deviceId: device.id }))
    )
  );

  // Eagerly create LiveDeviceConnection and LiveShockerState entries
  $effect(() => {
    const currentDeviceIds: string[] = [];
    for (const device of shareLinkRoot.devices ?? []) {
      currentDeviceIds.push(device.id);
      ensureLiveConnection(device.id);
      const conn = getLiveConnection(device.id);
      if (conn) {
        for (const shocker of device.shockers) {
          conn.ensureShockerState(shocker.id);
        }
      }
    }
    for (const [deviceId, conn] of liveConnections) {
      if (!currentDeviceIds.includes(deviceId)) {
        conn.disconnect();
        liveConnections.delete(deviceId);
      }
    }
  });
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
    {#each flatShockers as { shocker, deviceId } (shocker.id)}
      {@const liveConn = getLiveConnection(deviceId)}
      {@const liveState = liveConn?.getShockerState(shocker.id)}
      {@const isShockerLiveActive =
        (liveState?.isLive ?? false) && liveConn?.state === LiveConnectionState.Connected}
      <ShockerCard
        name={shocker.name}
        isPaused={shocker.paused !== 0}
        pauseReason={getPauseReason(shocker.paused)}
      >
        {#snippet live()}
          {#if shocker.permissions.live}
            <LiveButton
              hubId={deviceId}
              shockerId={shocker.id}
              isPaused={shocker.paused !== 0}
              connection={liveConn}
              {liveState}
              compact
            />
          {/if}
        {/snippet}
        {#if isShockerLiveActive && liveState && liveConn}
          <LiveControlModule shockerId={shocker.id} {liveState} connection={liveConn} />
        {:else}
          <ClassicControlModule
            id={shocker.id}
            isPaused={shocker.paused !== 0}
            limits={shocker.limits}
            permissions={shocker.permissions}
            ctrl={publicCtrl}
          />
        {/if}
      </ShockerCard>
    {/each}
  </div>
</div>

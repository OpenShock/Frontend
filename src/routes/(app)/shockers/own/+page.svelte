<script lang="ts">
  import { Layers, Loader, LogsIcon, OctagonAlert, Plus, Settings } from '@lucide/svelte';
  import { resolve } from '$app/paths';
  import { shockersV1Api } from '$lib/api';
  import type { NewShocker } from '$lib/api/internal/v1';
  import Container from '$lib/components/Container.svelte';
  import ClassicControlModule from '$lib/components/ControlModules/ClassicControlModule.svelte';
  import DialogShockerAdd, {
    type AddShockerData,
    defaultAddShockerData,
  } from '$lib/components/ControlModules/dialogs/dialog-shocker-add.svelte';
  import LiveControlModule from '$lib/components/ControlModules/LiveControlModule.svelte';
  import MapControlModule from '$lib/components/ControlModules/MapControlModule.svelte';
  import { ModuleType } from '$lib/components/ControlModules/ModuleType';
  import RichControlModule from '$lib/components/ControlModules/RichControlModule.svelte';
  import SimpleControlHeader from '$lib/components/ControlModules/SimpleControlHeader.svelte';
  import SimpleControlModule from '$lib/components/ControlModules/SimpleControlModule.svelte';
  import { dialog } from '$lib/components/dialog-manager/dialog-store.svelte';
  import { Button } from '$lib/components/ui/button';
  import * as Popover from '$lib/components/ui/popover';
  import { ControlDurationDefault, ControlIntensityDefault } from '$lib/constants/ControlConstants';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
  import { ownHubs, onlineHubs, refreshOwnHubs } from '$lib/state/hubs-state.svelte';
  import {
    ensureLiveConnection,
    getLiveConnection,
    LiveConnectionState,
    toggleLiveControl,
  } from '$lib/state/live-control-state.svelte';
  import { onMount } from 'svelte';
  import { toast } from 'svelte-sonner';

  let shockers = $derived(Array.from(ownHubs).flatMap(([, hub]) => hub.shockers));

  // Eagerly create LiveDeviceConnection and LiveShockerState entries
  // so template reads never mutate state (Svelte 5 forbids mutation in $derived/templates).
  $effect(() => {
    for (const [hubId, hub] of ownHubs) {
      ensureLiveConnection(hubId);
      const conn = getLiveConnection(hubId);
      if (conn) {
        for (const shocker of hub.shockers) {
          conn.ensureShockerState(shocker.id);
        }
      }
    }
  });

  let moduleType = $state<ModuleType>(ModuleType.ClassicControlModule);

  let shockIntensity = $state(ControlIntensityDefault);
  let vibrationIntensity = $state(ControlIntensityDefault);
  let duration = $state(ControlDurationDefault);

  async function openAddShockerDialog() {
    const hubs = Array.from(ownHubs);
    const result = await dialog.createDialog<NewShocker | undefined>((resolve) => ({
      content: DialogShockerAdd,
      props: {
        data: { ...defaultAddShockerData(), device: hubs[0]?.[0] ?? '' },
        hubs,
        resolve,
        close: () => resolve(undefined),
      },
      resolve,
    }));
    if (!result) return;
    try {
      await shockersV1Api.shockerRegisterShocker(result);
      toast.success('Shocker added');
      await refreshOwnHubs();
    } catch (error) {
      handleApiError(error);
    }
  }

  onMount(refreshOwnHubs);
</script>

{#if ownHubs.size === 0}
  <p>Loading...</p>
{:else}
  <Container>
    <div class="flex w-full content-center justify-between">
      <h1 class="text-2xl font-bold">Shockers</h1>
      <div>
        <Button variant="secondary" onclick={openAddShockerDialog}>
          <Plus /> Add Shocker
        </Button>
        <!-- Emergency Stop Button -->
        <Button variant="secondary" class="border-2 text-red-500">
          <OctagonAlert size="64" /> STOP
        </Button>
        <!-- Mode button -->
        <Popover.Root>
          <Popover.Trigger><Layers /></Popover.Trigger>
          <Popover.Content class="flex">
            <Button variant="ghost" onclick={() => (moduleType = ModuleType.ClassicControlModule)}>
              Classic
            </Button>
            <Button variant="ghost" onclick={() => (moduleType = ModuleType.RichControlModule)}>
              Rich
            </Button>
            <Button variant="ghost" onclick={() => (moduleType = ModuleType.SimpleControlModule)}>
              Simple
            </Button>
            <Button variant="ghost" onclick={() => (moduleType = ModuleType.MapControlModule)}>
              Map
            </Button>
          </Popover.Content>
        </Popover.Root>
        <!-- Settings button -->
        <Popover.Root>
          <Popover.Trigger>
            {#snippet child({ props })}
              <Button {...props} variant="ghost" class="p-0!" aria-label="Settings">
                <Settings />
              </Button>
            {/snippet}
          </Popover.Trigger>
          <Popover.Content class="flex flex-col gap-2">
            <Button variant="ghost" disabled>
              Global Limits
              <span class="text-muted-foreground ml-2 text-xs">(Coming soon)</span>
            </Button>
          </Popover.Content>
        </Popover.Root>
        <Button variant="ghost" aria-label="Logs" href={resolve('/shockers/logs')}>
          <LogsIcon />
        </Button>
      </div>
    </div>
    <hr class="border-2" />
    {#if moduleType === ModuleType.SimpleControlModule}
      <SimpleControlHeader bind:shockIntensity bind:vibrationIntensity bind:duration />
    {/if}
    {#if moduleType === ModuleType.MapControlModule}
      <MapControlModule {shockers} />
    {:else}
      <div class="flex flex-col gap-6">
        {#each Array.from(ownHubs) as [hubId, hub] (hubId)}
          {@const liveConn = getLiveConnection(hubId)}
          {@const isLive = liveConn?.state === LiveConnectionState.Connected}
          {@const isConnecting = liveConn?.state === LiveConnectionState.Connecting}
          {@const online = onlineHubs.get(hubId)?.isOnline ?? false}
          <div class="flex flex-col gap-3">
            <!-- Device header -->
            <div class="flex items-center gap-3">
              <span class="text-lg font-semibold">{hub.name}</span>
              <span class="size-2.5 rounded-full {online ? 'bg-green-400' : 'bg-red-500'}"
                title={online ? 'Online' : 'Offline'}
              ></span>
              <button
                class="cursor-pointer rounded border border-border bg-transparent px-1.5 py-px text-[10px] font-bold tracking-wider text-muted-foreground transition-all duration-200 hover:border-foreground hover:text-foreground
                  {isLive ? 'bg-gradient-to-r from-[rgb(185,123,255)] to-[#e100ff] bg-clip-text text-transparent [border-image:linear-gradient(to_right,rgb(167,89,255),#e100ff)_1]' : ''}
                  {isConnecting ? 'border-muted-foreground text-muted-foreground' : ''}"
                onclick={() => toggleLiveControl(hubId)}
                title={isLive
                  ? `Live — ${liveConn?.gateway} (${liveConn?.country}) — ${liveConn?.latency}ms`
                  : isConnecting
                    ? 'Connecting...'
                    : 'Connect to Live Control'}
              >
                LIVE
                {#if isConnecting}
                  <Loader class="inline size-3 animate-spin" />
                {/if}
              </button>
              {#if isLive && liveConn}
                <span class="text-muted-foreground text-xs">
                  {liveConn.gateway} ({liveConn.country}) — {liveConn.latency}ms
                </span>
              {/if}
            </div>

            <!-- Shockers grid -->
            <div class="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {#each hub.shockers as shocker (shocker.id)}
                {#if isLive && liveConn}
                  {@const liveState = liveConn.getShockerState(shocker.id)}
                  {#if liveState}
                    <LiveControlModule {shocker} {liveState} />
                  {/if}
                {:else if moduleType === ModuleType.ClassicControlModule}
                  <ClassicControlModule {shocker} />
                {:else if moduleType === ModuleType.RichControlModule}
                  <RichControlModule {shocker} />
                {:else if moduleType === ModuleType.SimpleControlModule}
                  <SimpleControlModule {shocker} {shockIntensity} {vibrationIntensity} {duration} />
                {:else}
                  <p>Unknown module type</p>
                {/if}
              {/each}
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </Container>
{/if}

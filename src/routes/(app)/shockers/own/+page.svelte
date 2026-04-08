<script lang="ts">
  import {
    Layers,
    LoaderCircle,
    LogsIcon,
    Plus,
    RotateCcw,
    Settings,
    Zap,
  } from '@lucide/svelte';
  import { resolve } from '$app/paths';
  import { shockersV1Api } from '$lib/api';
  import type { NewShocker } from '$lib/api/internal/v1';
  import Container from '$lib/components/Container.svelte';
  import ClassicControlModule from '$lib/components/ControlModules/ClassicControlModule.svelte';
  import DialogShockerAdd, {
    defaultAddShockerData,
  } from '$lib/components/ControlModules/dialogs/dialog-shocker-add.svelte';
  import LiveButton from '$lib/components/ControlModules/LiveButton.svelte';
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
  import { registerBreadcrumbs } from '$lib/state/breadcrumbs-state.svelte';
  import { ownHubs, onlineHubs, refreshOwnHubs } from '$lib/state/hubs-state.svelte';
  import {
    ensureLiveConnection,
    getLiveConnection,
    liveConnections,
    LiveConnectionState,
  } from '$lib/state/live-control-state.svelte';
  import { LocalStorageState } from '$lib/state/classes/local-storage-state.svelte';
  import { onMount } from 'svelte';
  import { toast } from 'svelte-sonner';

  registerBreadcrumbs(() => [{ label: 'Shockers' }]);

  let shockers = $derived(
    ownHubs
      .values()
      .flatMap((hub) => hub.shockers)
      .toArray()
  );
  let flatShockers = $derived(
    Array.from(ownHubs).flatMap(([hubId, hub]) =>
      hub.shockers.map((shocker) => ({ shocker, hubId }))
    )
  );

  // Eagerly create LiveDeviceConnection and LiveShockerState entries
  // so template reads never mutate state (Svelte 5 forbids mutation in $derived/templates).
  $effect(() => {
    const currentHubIds: string[] = [];
    for (const [hubId, hub] of ownHubs) {
      currentHubIds.push(hubId);
      ensureLiveConnection(hubId);
      const conn = getLiveConnection(hubId);
      if (conn) {
        for (const shocker of hub.shockers) {
          conn.ensureShockerState(shocker.id);
        }
      }
    }
    // Clean up connections for hubs that no longer exist
    for (const [hubId, conn] of liveConnections) {
      if (!currentHubIds.includes(hubId)) {
        conn.disconnect();
        liveConnections.delete(hubId);
      }
    }
  });

  let moduleType = $state<ModuleType>(ModuleType.ClassicControlModule);
  const groupByHub = new LocalStorageState<boolean>('shockerGroupByHub', false);
  let loading = $state(true);
  let refreshing = $state(false);

  let shockIntensity = $state(ControlIntensityDefault);
  let vibrationIntensity = $state(ControlIntensityDefault);
  let duration = $state(ControlDurationDefault);

  async function loadShockers() {
    loading = true;
    await refreshOwnHubs();
    loading = false;
  }

  async function refresh() {
    refreshing = true;
    await refreshOwnHubs();
    refreshing = false;
    toast.success('Shockers refreshed');
  }

  async function openAddShockerDialog() {
    const hubs = ownHubs.entries().toArray();
    if (hubs.length === 0) {
      toast.error('You need to create a hub before adding shockers.');
      return;
    }
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

  onMount(loadShockers);
</script>

{#if loading}
  <Container class="items-center justify-center">
    <div class="flex items-center gap-3 p-12">
      <LoaderCircle class="size-6 animate-spin" />
      <span class="text-muted-foreground">Loading shockers...</span>
    </div>
  </Container>
{:else}
  <Container>
    <div class="flex w-full flex-wrap items-center justify-between gap-2">
      <h1 class="text-2xl font-bold">Shockers</h1>
      <div class="flex flex-wrap items-center gap-1">
        <Button variant="secondary" size="sm" onclick={openAddShockerDialog}>
          <Plus class="size-4" /> Add Shocker
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onclick={refresh}
          disabled={refreshing}
          aria-label="Refresh"
        >
          <RotateCcw class={refreshing ? 'size-4 animate-spin' : 'size-4'} />
        </Button>
        <!-- Mode button -->
        <Popover.Root>
          <Popover.Trigger>
            {#snippet child({ props })}
              <Button {...props} variant="ghost" size="sm" aria-label="View mode">
                <Layers class="size-4" />
              </Button>
            {/snippet}
          </Popover.Trigger>
          <Popover.Content class="flex flex-col gap-1" align="end">
            <Button
              variant={moduleType === ModuleType.ClassicControlModule ? 'secondary' : 'ghost'}
              size="sm"
              onclick={() => (moduleType = ModuleType.ClassicControlModule)}
            >
              Classic
            </Button>
            <Button
              variant={moduleType === ModuleType.RichControlModule ? 'secondary' : 'ghost'}
              size="sm"
              onclick={() => (moduleType = ModuleType.RichControlModule)}
            >
              Rich
            </Button>
            <Button
              variant={moduleType === ModuleType.SimpleControlModule ? 'secondary' : 'ghost'}
              size="sm"
              onclick={() => (moduleType = ModuleType.SimpleControlModule)}
            >
              Simple
            </Button>
            <Button
              variant={moduleType === ModuleType.MapControlModule ? 'secondary' : 'ghost'}
              size="sm"
              onclick={() => (moduleType = ModuleType.MapControlModule)}
            >
              Map
            </Button>
          </Popover.Content>
        </Popover.Root>
        <!-- Settings button -->
        <Popover.Root>
          <Popover.Trigger>
            {#snippet child({ props })}
              <Button {...props} variant="ghost" size="sm" aria-label="Settings">
                <Settings class="size-4" />
              </Button>
            {/snippet}
          </Popover.Trigger>
          <Popover.Content class="flex flex-col gap-2" align="end">
            <Button
              variant={groupByHub.value ? 'secondary' : 'ghost'}
              size="sm"
              onclick={() => (groupByHub.value = !groupByHub.value)}
            >
              Group by Hub
            </Button>
            <Button variant="ghost" size="sm" disabled>
              Global Limits
              <span class="text-muted-foreground ml-2 text-xs">(Coming soon)</span>
            </Button>
          </Popover.Content>
        </Popover.Root>
        <Button variant="ghost" size="sm" aria-label="Logs" href={resolve('/shockers/logs')}>
          <LogsIcon class="size-4" />
        </Button>
      </div>
    </div>

    <hr class="border-border" />

    {#if shockers.length === 0}
      <div class="flex flex-col items-center justify-center gap-4 py-16">
        <Zap class="text-muted-foreground size-12" />
        <div class="text-center">
          <h2 class="text-lg font-semibold">No shockers yet</h2>
          <p class="text-muted-foreground text-sm">
            {#if ownHubs.size === 0}
              Create a hub first, then add shockers to it.
            {:else}
              Add a shocker to one of your hubs to get started.
            {/if}
          </p>
        </div>
        <Button onclick={openAddShockerDialog} disabled={ownHubs.size === 0}>
          <Plus class="size-4" /> Add Shocker
        </Button>
      </div>
    {:else}
      {#if moduleType === ModuleType.SimpleControlModule}
        <SimpleControlHeader bind:shockIntensity bind:vibrationIntensity bind:duration />
      {/if}
      {#if moduleType === ModuleType.MapControlModule}
        <MapControlModule {shockers} />
      {:else}
        {#snippet shockerCard(
          shocker: import('$lib/api/internal/v1').ShockerResponse,
          hubId: string
        )}
          {@const liveConn = getLiveConnection(hubId)}
          {@const liveState = liveConn?.getShockerState(shocker.id)}
          {@const isShockerLiveActive =
            (liveState?.isLive ?? false) && liveConn?.state === LiveConnectionState.Connected}
          <div>
            <LiveButton {hubId} shockerId={shocker.id} isPaused={shocker.isPaused} connection={liveConn} {liveState} />
            {#if isShockerLiveActive && liveState && liveConn}
              <LiveControlModule {shocker} {liveState} connection={liveConn} owned />
            {:else if moduleType === ModuleType.ClassicControlModule}
              <ClassicControlModule {shocker} />
            {:else if moduleType === ModuleType.RichControlModule}
              <RichControlModule {shocker} />
            {:else if moduleType === ModuleType.SimpleControlModule}
              <SimpleControlModule {shocker} {shockIntensity} {vibrationIntensity} {duration} />
            {:else}
              <p>Unknown module type</p>
            {/if}
          </div>
        {/snippet}

        {#if groupByHub.value}
          <div class="flex flex-col gap-6">
            {#each Array.from(ownHubs) as [hubId, hub] (hubId)}
              {@const online = onlineHubs.get(hubId)?.isOnline ?? false}
              <div class="flex flex-col gap-3">
                <div class="flex items-center gap-3">
                  <span class="text-lg font-semibold">{hub.name}</span>
                  <span
                    class="size-2.5 rounded-full {online ? 'bg-green-400' : 'bg-red-500'}"
                    title={online ? 'Online' : 'Offline'}
                  ></span>
                </div>
                <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {#each hub.shockers as shocker (shocker.id)}
                    {@render shockerCard(shocker, hubId)}
                  {/each}
                </div>
              </div>
            {/each}
          </div>
        {:else}
          <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {#each flatShockers as { shocker, hubId } (shocker.id)}
              {@render shockerCard(shocker, hubId)}
            {/each}
          </div>
        {/if}
      {/if}
    {/if}
  </Container>
{/if}

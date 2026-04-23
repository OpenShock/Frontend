<script lang="ts">
  import { User } from '@lucide/svelte';
  import Container from '$lib/components/Container.svelte';
  import ClassicControlModule from '$lib/components/ControlModules/ClassicControlModule.svelte';
  import LiveButton from '$lib/components/ControlModules/LiveButton.svelte';
  import LiveControlModule from '$lib/components/ControlModules/LiveControlModule.svelte';
  import ShockerCard from '$lib/components/ControlModules/ShockerCard.svelte';
  import * as Avatar from '$lib/components/ui/avatar';
  import { onlineHubs } from '$lib/state/hubs-state.svelte';
  import { registerBreadcrumbs } from '$lib/state/breadcrumbs-state.svelte';
  import { ControlType } from '$lib/signalr/models/ControlType';
  import { getConnection } from '$lib/signalr/user.svelte';
  import { serializeControlMessages } from '$lib/signalr/serializers/Control';
  import {
    ensureLiveConnection,
    getLiveConnection,
    liveConnections,
    LiveConnectionState,
  } from '$lib/state/live-control-state.svelte';
  import { sharedHubsState, refreshSharedHubs } from '$lib/state/shared-hubs-state.svelte';
  import { onMount } from 'svelte';
  import PageHeader from '$lib/components/PageHeader.svelte';

  registerBreadcrumbs(() => [{ label: 'Shared Shockers' }]);

  onMount(refreshSharedHubs);

  const hasSharedShockers = $derived(sharedHubsState.value.length > 0);

  function sharedCtrl(id: string, type: ControlType, intensity: number, duration: number) {
    const conn = getConnection();
    if (conn) serializeControlMessages(conn, [{ id, type, intensity, duration }]);
  }

  // Eagerly create LiveDeviceConnection and LiveShockerState entries
  $effect(() => {
    const currentDeviceIds: string[] = [];
    for (const owner of sharedHubsState.value) {
      for (const device of owner.devices) {
        currentDeviceIds.push(device.id);
        ensureLiveConnection(device.id);
        const conn = getLiveConnection(device.id);
        if (conn) {
          for (const shocker of device.shockers) {
            conn.ensureShockerState(shocker.id);
          }
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

{#if sharedHubsState.value == null}
  <p>Loading...</p>
{:else}
  <PageHeader title="Shared Shockers" subtitle="Manage shared shockers with other users"></PageHeader>
  <div class="flex w-full content-center justify-between">
    <h1 class="text-2xl font-bold">Shared Shockers</h1>
  </div>
  <hr class="border-border w-full" />

  {#if !hasSharedShockers}
    <div class="text-muted-foreground flex flex-col items-center justify-center py-12">
      <User size={48} class="mb-4 opacity-50" />
      <p class="text-lg">No shockers have been shared with you yet.</p>
      <p class="text-sm">When someone shares their shockers with you, they'll appear here.</p>
    </div>
  {:else}
    <div class="flex w-full flex-col gap-5">
      {#each sharedHubsState.value as owner (owner.id)}
        {@const totalShockers = owner.devices.reduce((acc, d) => acc + d.shockers.length, 0)}
        <!-- Owner Section -->
        <section class="bg-muted/40 flex flex-col gap-3 rounded-lg p-2 sm:p-3">
          <!-- Owner Header -->
          <div class="flex items-center gap-3 px-1">
            <Avatar.Root class="h-9 w-9">
              <Avatar.Image src={owner.image} alt={owner.name} />
              <Avatar.Fallback>
                <User size={18} />
              </Avatar.Fallback>
            </Avatar.Root>
            <div class="min-w-0">
              <h2 class="truncate text-lg font-semibold">{owner.name}</h2>
              <p class="text-muted-foreground text-xs">
                {totalShockers} shocker{totalShockers !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          <!-- Shockers across all of this owner's hubs -->
          <div class="bg-background/60 flex flex-wrap justify-center gap-3 rounded-md p-2 sm:justify-start">
            {#each owner.devices as device (device.id)}
              {@const hubOnline = onlineHubs.get(device.id)?.isOnline ?? false}
              {#each device.shockers as shocker (shocker.id)}
                {@const liveConn = getLiveConnection(device.id)}
                {@const liveState = liveConn?.getShockerState(shocker.id)}
                {@const isShockerLiveActive =
                  (liveState?.isLive ?? false) &&
                  liveConn?.state === LiveConnectionState.Connected}
                <ShockerCard
                  name={shocker.name}
                  hubName={device.name}
                  {hubOnline}
                  showHubBadge
                  isPaused={shocker.isPaused}
                >
                  {#snippet live()}
                    {#if shocker.permissions.live}
                      <LiveButton
                        hubId={device.id}
                        shockerId={shocker.id}
                        isPaused={shocker.isPaused}
                        connection={liveConn}
                        {liveState}
                        compact
                      />
                    {/if}
                  {/snippet}
                  {#if isShockerLiveActive && liveState && liveConn}
                    <LiveControlModule
                      shockerId={shocker.id}
                      {liveState}
                      connection={liveConn}
                    />
                  {:else}
                    <ClassicControlModule
                      id={shocker.id}
                      isPaused={shocker.isPaused}
                      limits={shocker.limits}
                      permissions={shocker.permissions}
                      ctrl={sharedCtrl}
                    />
                  {/if}
                </ShockerCard>
              {/each}
            {/each}
          </div>
        </section>
      {/each}
    </div>
  {/if}
{/if}

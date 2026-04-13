<script lang="ts">
  import { Router, User, Wifi, WifiOff } from '@lucide/svelte';
  import Container from '$lib/components/Container.svelte';
  import ClassicControlModule from '$lib/components/ControlModules/ClassicControlModule.svelte';
  import LiveButton from '$lib/components/ControlModules/LiveButton.svelte';
  import LiveControlModule from '$lib/components/ControlModules/LiveControlModule.svelte';
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
  <Container>
    <div class="flex w-full content-center justify-between">
      <h1 class="text-2xl font-bold">Shared Shockers</h1>
    </div>
    <hr class="border-2" />

    {#if !hasSharedShockers}
      <div class="text-muted-foreground flex flex-col items-center justify-center py-12">
        <User size={48} class="mb-4 opacity-50" />
        <p class="text-lg">No shockers have been shared with you yet.</p>
        <p class="text-sm">When someone shares their shockers with you, they'll appear here.</p>
      </div>
    {:else}
      <div class="mt-4 flex flex-col gap-6">
        {#each sharedHubsState.value as owner (owner.id)}
          {@const totalShockers = owner.devices.reduce((acc, d) => acc + d.shockers.length, 0)}
          <!-- Owner Section -->
          <div class="rounded-lg border p-4">
            <!-- Owner Header -->
            <div class="mb-4 flex items-center gap-3">
              <Avatar.Root class="h-10 w-10">
                <Avatar.Image src={owner.image} alt={owner.name} />
                <Avatar.Fallback>
                  <User size={20} />
                </Avatar.Fallback>
              </Avatar.Root>
              <div>
                <h2 class="text-xl font-semibold">{owner.name}</h2>
                <p class="text-muted-foreground text-sm">
                  {totalShockers} shocker{totalShockers !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            <!-- Devices/Hubs for this owner -->
            <div class="flex flex-col gap-4">
              {#each owner.devices as device (device.id)}
                <!-- Device/Hub Header -->
                <div class="bg-muted/30 rounded-md p-3">
                  <div class="mb-3 flex items-center gap-2">
                    <Router size={18} />
                    <span class="font-medium">{device.name}</span>
                    {#if onlineHubs.get(device.id)?.isOnline}
                      <span class="flex items-center gap-1 text-xs text-green-500">
                        <Wifi size={14} />
                        Online
                      </span>
                    {:else}
                      <span class="flex items-center gap-1 text-xs text-red-500">
                        <WifiOff size={14} />
                        Offline
                      </span>
                    {/if}
                  </div>

                  <!-- Shockers Grid -->
                  <div class="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {#each device.shockers as shocker (shocker.id)}
                      {@const liveConn = getLiveConnection(device.id)}
                      {@const liveState = liveConn?.getShockerState(shocker.id)}
                      {@const isShockerLiveActive =
                        (liveState?.isLive ?? false) &&
                        liveConn?.state === LiveConnectionState.Connected}
                      <div>
                        {#if shocker.permissions.live}
                          <LiveButton
                            hubId={device.id}
                            shockerId={shocker.id}
                            isPaused={shocker.isPaused}
                            connection={liveConn}
                            {liveState}
                          />
                        {/if}
                        {#if isShockerLiveActive && liveState && liveConn}
                          <LiveControlModule {shocker} {liveState} connection={liveConn} />
                        {:else}
                          <ClassicControlModule
                            id={shocker.id}
                            name={shocker.name}
                            isPaused={shocker.isPaused}
                            limits={shocker.limits}
                            permissions={shocker.permissions}
                            ctrl={sharedCtrl}
                          />
                        {/if}
                      </div>
                    {/each}
                  </div>
                </div>
              {/each}
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </Container>
{/if}

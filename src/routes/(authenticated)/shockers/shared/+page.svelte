<script lang="ts">
  import { Router, User, Wifi, WifiOff } from '@lucide/svelte';
  import Container from '$lib/components/Container.svelte';
  import SharedShockerControlModule from '$lib/components/ControlModules/SharedShockerControlModule.svelte';
  import * as Avatar from '$lib/components/ui/avatar';
  import { OnlineHubsStore } from '$lib/stores/HubsStore';
  import { SharedHubsStore, refreshSharedHubs } from '$lib/stores/SharedHubsStore';
  import { onMount } from 'svelte';

  onMount(refreshSharedHubs);

  const hasSharedShockers = $derived($SharedHubsStore.length > 0);
</script>

{#if $SharedHubsStore == null}
  <p>Loading...</p>
{:else}
  <Container>
    <div class="w-full flex content-center justify-between">
      <h1 class="text-2xl font-bold">Shared Shockers</h1>
    </div>
    <hr class="border-2" />

    {#if !hasSharedShockers}
      <div class="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <User size={48} class="mb-4 opacity-50" />
        <p class="text-lg">No shockers have been shared with you yet.</p>
        <p class="text-sm">When someone shares their shockers with you, they'll appear here.</p>
      </div>
    {:else}
      <div class="flex flex-col gap-6 mt-4">
        {#each $SharedHubsStore as owner (owner.id)}
          <!-- Owner Section -->
          <div class="border rounded-lg p-4">
            <!-- Owner Header -->
            <div class="flex items-center gap-3 mb-4">
              <Avatar.Root class="h-10 w-10">
                <Avatar.Image src={owner.image} alt={owner.name} />
                <Avatar.Fallback>
                  <User size={20} />
                </Avatar.Fallback>
              </Avatar.Root>
              <div>
                <h2 class="text-xl font-semibold">{owner.name}</h2>
                {@const totalShockers = owner.devices.reduce((acc, d) => acc + d.shockers.length, 0)}
                <p class="text-sm text-muted-foreground">
                  {totalShockers} shocker{totalShockers !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            <!-- Devices/Hubs for this owner -->
            <div class="flex flex-col gap-4">
              {#each owner.devices as device (device.id)}
                <!-- Device/Hub Header -->
                <div class="bg-muted/30 rounded-md p-3">
                  <div class="flex items-center gap-2 mb-3">
                    <Router size={18} />
                    <span class="font-medium">{device.name}</span>
                    {#if $OnlineHubsStore.get(device.id)?.isOnline}
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
                      <SharedShockerControlModule {shocker} />
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

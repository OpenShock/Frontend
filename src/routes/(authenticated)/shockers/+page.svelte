<script lang="ts">
  import { shockerV2Api } from '$lib/api';
  import type { Control, ControlType } from '$lib/api/internal/v2';
  import ClassicControlModule from '$lib/components/ControlModules/ClassicControlModule.svelte';
  import MapControlModule from '$lib/components/ControlModules/MapControlModule.svelte';
  import { ModuleType } from '$lib/components/ControlModules/ModuleType';
  import RichControlModule from '$lib/components/ControlModules/RichControlModule.svelte';
  import SimpleControlHeader from '$lib/components/ControlModules/SimpleControlHeader.svelte';
  import SimpleControlModule from '$lib/components/ControlModules/SimpleControlModule.svelte';
  import * as Popover from '$lib/components/ui/popover';
  import { OwnHubsStore } from '$lib/stores/HubsStore';

  let shockers = $derived(Array.from($OwnHubsStore).flatMap(([, hub]) => hub.shockers));

  let moduleType = $state<ModuleType>(ModuleType.ClassicControlModule);

  function handleCommand(
    event: CustomEvent<{ id: string; type: ControlType; intensity: number; duration: number }>
  ) {
    let shocks: Control[] = [
      {
        id: event.detail.id,
        type: event.detail.type,
        intensity: event.detail.intensity,
        duration: event.detail.duration,
      },
    ];
    shockerV2Api.shockerSendControl({
      shocks,
      customName: 'Custom name',
    });
  }
</script>

<!-- Rounded bordered container -->
<div class="container flex flex-col gap-4 py-4">
  {#if $OwnHubsStore == null}
    <p>Loading...</p>
  {:else}
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold">Shockers</h1>
      <div>
        <!-- Mode button -->
        <Popover.Root>
          <Popover.Trigger><i class="fa-solid fa-layer-group"></i></Popover.Trigger>
          <Popover.Content>
            <div class="flex gap-2">
              <button
                class="btn variant-filled-secondary p-2"
                onclick={() => (moduleType = ModuleType.ClassicControlModule)}
              >
                Classic
              </button>
              <button
                class="btn variant-filled-secondary p-2"
                onclick={() => (moduleType = ModuleType.RichControlModule)}
              >
                Rich
              </button>
              <button
                class="btn variant-filled-secondary p-1"
                onclick={() => (moduleType = ModuleType.SimpleControlModule)}
              >
                Simple
              </button>
              <button
                class="btn variant-filled-secondary p-1"
                onclick={() => (moduleType = ModuleType.MapControlModule)}
              >
                Map
              </button>
            </div>
          </Popover.Content>
        </Popover.Root>
        <!-- Options button -->
        <button class="btn p-1" aria-label="Options">
          <i class="fa-solid fa-cog"></i>
        </button>
      </div>
    </div>
    <hr class="border-2" />
    {#if moduleType === ModuleType.SimpleControlModule}
      <SimpleControlHeader />
    {/if}
    {#if moduleType === ModuleType.MapControlModule}
      <MapControlModule {shockers} />
    {:else}
      <div class="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {#each shockers ?? [] as shocker (shocker.id)}
          {#if moduleType === ModuleType.ClassicControlModule}
            <ClassicControlModule {shocker} on:command={handleCommand} />
          {:else if moduleType === ModuleType.RichControlModule}
            <RichControlModule {shocker} on:command={handleCommand} />
          {:else if moduleType === ModuleType.SimpleControlModule}
            <SimpleControlModule {shocker} on:command={handleCommand} />
          {:else}
            <p>Unknown module type</p>
          {/if}
        {/each}
      </div>
    {/if}
  {/if}
</div>

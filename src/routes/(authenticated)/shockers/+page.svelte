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
  import { OwnDevicesStore } from '$lib/stores/DevicesStore';

  let shockers = $derived(
    $OwnDevicesStore?.flatMap((device) => device.shockers)?.filter((shocker) => !!shocker) ?? []
  );

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
<div class="container mx-auto py-4 flex flex-col flex-wrap justify-center items-stretch gap-4">
  {#if $OwnDevicesStore == null}
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
                class="btn p-2 variant-filled-secondary"
                onclick={() => (moduleType = ModuleType.ClassicControlModule)}
              >
                Classic
              </button>
              <button
                class="btn p-2 variant-filled-secondary"
                onclick={() => (moduleType = ModuleType.RichControlModule)}
              >
                Rich
              </button>
              <button
                class="btn p-1 variant-filled-secondary"
                onclick={() => (moduleType = ModuleType.SimpleControlModule)}
              >
                Simple
              </button>
              <button
                class="btn p-1 variant-filled-secondary"
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
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
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

<script lang="ts">
  import { shockerV2Api } from '$lib/api';
  import type { ControlType } from '$lib/api/internal/v1';
  import type { Control } from '$lib/api/internal/v2';
  import ClassicControlModule from '$lib/components/ControlModules/ClassicControlModule.svelte';
  import MapControlModule from '$lib/components/ControlModules/MapControlModule.svelte';
  import { ModuleType } from '$lib/components/ControlModules/ModuleType';
  import RichControlModule from '$lib/components/ControlModules/RichControlModule.svelte';
  import SimpleControlHeader from '$lib/components/ControlModules/SimpleControlHeader.svelte';
  import SimpleControlModule from '$lib/components/ControlModules/SimpleControlModule.svelte';
  import { OwnDevicesStore } from '$lib/stores/DevicesStore';
  import { popup, type PopupSettings } from '@skeletonlabs/skeleton';

  let shockers = $derived(
    $OwnDevicesStore?.flatMap((device) => device.shockers)?.filter((shocker) => !!shocker) ?? []
  );

  let moduleType: ModuleType = $state(ModuleType.ClassicControlModule);

  const modeClick: PopupSettings = {
    event: 'click',
    target: 'modeClick',
    placement: 'bottom',
  };

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
        <button class="btn p-1" use:popup={modeClick}>
          <i class="fa-solid fa-layer-group"></i>
        </button>
        <div class="card p-4 max-w-md" data-popup="modeClick">
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
          <div class="arrow bg-surface-100-800-token"></div>
        </div>
        <!-- Options button -->
        <button class="btn p-1">
          <i class="fa-solid fa-cog"></i>
        </button>
      </div>
    </div>
    <hr class="border-2" />
    {#if moduleType === ModuleType.SimpleControlModule}
      <SimpleControlHeader />
    {/if}
    {#if moduleType === ModuleType.MapControlModule}
      <MapControlModule {shockers} on:command={handleCommand} />
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

<script lang="ts">
  import RichControlModule from '$lib/components/ControlModules/RichControlModule.svelte';
  import SimpleControlHeader from '$lib/components/ControlModules/SimpleControlHeader.svelte';
  import SimpleControlModule from '$lib/components/ControlModules/SimpleControlModule.svelte';
  import { popup, type PopupSettings } from '@skeletonlabs/skeleton';
  import ClassicControlModule from './ClassicControlModule.svelte';
  import type { ResponseDeviceWithShockers, ShockerResponse } from '$lib/api/internal/v1';

  enum ModuleType {
    ClassicControlModule,
    RichControlModule,
    SimpleControlModule,
  }

  export let device: ResponseDeviceWithShockers;

  let moduleType: ModuleType = ModuleType.ClassicControlModule;

  const Width = 3;

  $: matrix =
    device.shockers?.reduce(
      (acc, shocker, i) => {
        const row = Math.floor(i / Width);
        if (acc[row] == null) {
          acc[row] = [];
        }

        if (shocker.id !== null && shocker.name !== null) {
          acc[row].push(shocker as { id: string; name: string });
        }

        return acc;
      },
      [] as { id: string; name: string }[][]
    ) ?? [];

  const modeClick: PopupSettings = {
    event: 'click',
    target: 'modeClick',
    placement: 'bottom',
  };

  function handleCommand(cmd: CustomEvent<any>) {
    console.log(cmd);
  }
</script>

<div class="card flex flex-col items-stretch">
  <div class="mx-2 my-1 flex items-center justify-between">
    {device.name}
    <div>
      <!-- Mode button -->
      <button class="btn p-1" use:popup={modeClick}>
        <i class="fa-solid fa-layer-group" />
      </button>
      <div class="card p-4 max-w-md" data-popup="modeClick">
        <div class="flex gap-2">
          <button
            class="btn p-2 variant-filled-secondary"
            on:click={() => (moduleType = ModuleType.ClassicControlModule)}
          >
            Classic
          </button>
          <button
            class="btn p-2 variant-filled-secondary"
            on:click={() => (moduleType = ModuleType.RichControlModule)}
          >
            Rich
          </button>
          <button
            class="btn p-1 variant-filled-secondary"
            on:click={() => (moduleType = ModuleType.SimpleControlModule)}
          >
            Simple
          </button>
        </div>
        <div class="arrow bg-surface-100-800-token" />
      </div>
      <!-- Options button -->
      <button class="btn p-1">
        <i class="fa-solid fa-cog" />
      </button>
    </div>
  </div>
  <hr />
  {#if moduleType === ModuleType.SimpleControlModule}
    <SimpleControlHeader />
  {/if}
  <div class="p-2">
    <!-- Grid of controls -->
    <div class="flex flex-col gap-2">
      {#each matrix as m1}
        <div class="flex flex-row gap-2">
          {#each m1 as shocker}
            {#if moduleType === ModuleType.ClassicControlModule}
              <ClassicControlModule {shocker} on:command={handleCommand} />
            {:else if moduleType === ModuleType.RichControlModule}
              <RichControlModule {shocker} on:command={handleCommand} />
            {:else if moduleType === ModuleType.SimpleControlModule}
              <SimpleControlModule {shocker} on:command={handleCommand} />
            {/if}
          {/each}
        </div>
      {/each}
    </div>
  </div>
</div>

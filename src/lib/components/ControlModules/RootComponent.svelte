<script lang="ts">
  import RichControlModule from '$lib/components/ControlModules/RichControlModule.svelte';
  import SimpleControlHeader from '$lib/components/ControlModules/SimpleControlHeader.svelte';
  import SimpleControlModule from '$lib/components/ControlModules/SimpleControlModule.svelte';
  import { popup, type PopupSettings } from '@skeletonlabs/skeleton';
  import ClassicControlModule from './ClassicControlModule.svelte';

  enum ModuleType {
    ClassicControlModule,
    RichControlModule,
    SimpleControlModule,
  }

  export let name: string;

  let moduleType: ModuleType = ModuleType.ClassicControlModule;

  const modeClick: PopupSettings = {
    event: 'click',
    target: 'modeClick',
    placement: 'bottom',
  };
</script>

<div class="card !bg-slate-500 flex flex-col items-stretch">
  <div class="mx-2 my-1 flex items-center justify-between">
    {name}
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
      {#each Array(4) as _, i}
        <div class="flex flex-row gap-2">
          {#each Array(3) as _, j}
            {#if moduleType === ModuleType.ClassicControlModule}
              <ClassicControlModule name={`Control ${i * 3 + j + 1}`} />
            {:else if moduleType === ModuleType.RichControlModule}
              <RichControlModule name={`Control ${i * 3 + j + 1}`} />
            {:else if moduleType === ModuleType.SimpleControlModule}
              <SimpleControlModule name={`Control ${i * 3 + j + 1}`} />
            {/if}
          {/each}
        </div>
      {/each}
    </div>
  </div>
</div>

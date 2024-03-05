<script lang="ts">
  import RichControlModule from '$lib/components/ControlModules/RichControlModule.svelte';
  import SimpleControlHeader from '$lib/components/ControlModules/SimpleControlHeader.svelte';
  import SimpleControlModule from '$lib/components/ControlModules/SimpleControlModule.svelte';

  enum ModuleType {
    RichControlModule,
    SimpleControlModule,
  }

  let moduleType: ModuleType = ModuleType.RichControlModule;
</script>

<div class="container h-full mx-auto flex justify-center items-center">
  <div class="card !bg-slate-500 flex flex-col items-stretch">
    <div class="mx-2 my-1 flex items-center justify-between">
      Nameeeeeeeeeee
      <div>
        <!-- Mode button -->
        <button
          class="btn p-1"
          on:click={() =>
            moduleType === ModuleType.RichControlModule
              ? (moduleType = ModuleType.SimpleControlModule)
              : (moduleType = ModuleType.RichControlModule)}
        >
          <i class="fa-solid fa-layer-group" />
        </button>
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
              {#if moduleType === ModuleType.RichControlModule}
                <RichControlModule name={`Control ${i * 3 + j + 1}`} />
              {:else}
                <SimpleControlModule name={`Control ${i * 3 + j + 1}`} />
              {/if}
            {/each}
          </div>
        {/each}
      </div>
    </div>
  </div>
</div>

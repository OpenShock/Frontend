<script lang="ts">
  import { asset } from '$app/paths';
  import { registerBreadcrumbs } from '$lib/state/breadcrumbs-state.svelte';
  import DotGrid from '$lib/components/DotGrid.svelte';

  let { data } = $props();

  registerBreadcrumbs(() => [{ label: 'OpenShock', href: '/' }]);

  let grid: DotGrid | undefined = $state();
</script>

<section
  aria-label="Home"
  class="relative flex h-full flex-col items-center justify-center space-y-6 overflow-hidden text-center text-white"
  onpointermove={(e) => grid?.handlePointerMove(e)}
>
  <DotGrid bind:this={grid} />

  <span class="relative flex">
    <img class="h-9 pr-2 sm:h-14 md:h-20 md:pr-4" src={asset('/IconSpinning.svg')} alt="logo" />
    <img class="h-9 sm:h-14 md:h-20" src={asset('/LogoBakedFont.svg')} alt="logo" />
  </span>
  <p class="relative text-lg opacity-75 md:text-2xl">
    The go-to platform for safe, reliable, real low-latency remote shocking.<br />
    {#if data.ok}
      <span class="font-semibold">{data.deviceCount}</span> people online right now.
    {/if}
  </p>
  <div class="relative flex space-x-4 pt-8 text-sm opacity-75">
    <a href="https://openshock.org" target="_blank" rel="noopener" class="hover:underline">
      Learn More
    </a>
    <span>·</span>
    <a href="https://wiki.openshock.org" target="_blank" rel="noopener" class="hover:underline">
      Wiki
    </a>
  </div>
</section>

<script lang="ts">
  import { asset } from '$app/paths';
  import { registerBreadcrumbs } from '#lib/state/breadcrumbs-state.svelte.js';
  import { DotGrid } from '@openshock/svelte-core/components';

  let { data } = $props();

  registerBreadcrumbs(() => [{ label: 'OpenShock', href: '' }]);

  let grid: DotGrid | undefined = $state();
</script>

<svelte:head>
  <link rel="preload" href={asset('logo.svg')} as="image" type="image/svg+xml" />
</svelte:head>

<section
  aria-label="Home"
  class="relative flex h-full flex-col items-center justify-center space-y-6 overflow-hidden bg-zinc-950 text-center text-white"
  onpointermove={(e) => grid?.handlePointerMove(e)}
>
  <DotGrid bind:this={grid} />

  <h1>
    <img class="h-10 sm:h-16 md:h-22" src={asset('logo.svg')} alt="OpenShock" />
  </h1>

  <p class="relative text-lg opacity-75 md:text-2xl">
    The go-to platform for safe, reliable, real low-latency remote shocking.<br />
    {#if data.ok}
      <span class="font-semibold">{data.deviceCount}</span> hubs online right now.
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

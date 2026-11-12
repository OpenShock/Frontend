<script lang="ts">
  import { m } from '#lib/paraglide/messages.js';
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
  aria-label={m.landing_section_label()}
  class="relative flex h-full flex-col items-center justify-center space-y-6 overflow-hidden bg-zinc-950 text-center text-white"
  onpointermove={(e) => grid?.handlePointerMove(e)}
>
  <DotGrid bind:this={grid} />

  <h1>
    <img class="h-10 sm:h-16 md:h-22" src={asset('logo.svg')} alt="OpenShock" />
  </h1>

  <p class="relative text-lg opacity-75 md:text-2xl">
    {m.landing_tagline()}<br />
    {#if data.ok}
      {m.landing_hubs_online()}
      <span class="font-semibold">{data.deviceCount}</span>
    {/if}
  </p>
  <div class="relative flex space-x-4 pt-8 text-sm opacity-75">
    <a href="https://openshock.org" target="_blank" rel="noopener" class="hover:underline">
      {m.landing_learn_more()}
    </a>
    <span>·</span>
    <a href="https://wiki.openshock.org" target="_blank" rel="noopener" class="hover:underline">
      {m.landing_wiki()}
    </a>
  </div>
</section>

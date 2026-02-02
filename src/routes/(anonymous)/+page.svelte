<script lang="ts">
  import { asset } from '$app/paths';

  let { data } = $props();
</script>

<section class="flex flex-col items-center justify-center h-full text-white text-center space-y-6">
  <span class="flex">
    <img class="h-9 pr-2 sm:h-14 md:h-20 md:pr-4" src={asset('/IconSpinning.svg')} alt="logo" />
    <img class="h-9 sm:h-14 md:h-20" src={asset('/LogoBakedFont.svg')} alt="logo" />
  </span>
  <p class="text-lg md:text-2xl opacity-75">
    The go-to platform for safe, reliable, real low-latency remote shocking.<br />
    {#if data.ok}
      <span class="font-semibold">{data.deviceCount}</span> people online right now.
    {/if}
  </p>
  <div class="flex space-x-4 pt-8 text-sm opacity-75">
    <a href="https://openshock.org" target="_blank" rel="noopener" class="hover:underline">
      Learn More
    </a>
    <span>·</span>
    <a href="https://wiki.openshock.org" target="_blank" rel="noopener" class="hover:underline">
      Wiki
    </a>
  </div>
</section>

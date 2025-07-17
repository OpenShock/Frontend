<script lang="ts">
  import { metaApi } from '$lib/api';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
  import { onMount } from 'svelte';

  let deviceCount = $state(0);

  onMount(async () => {
    try {
      const { data } = await metaApi.publicGetOnlineDevicesStatistics();
      deviceCount = data.devicesOnline;
    } catch (err) {
      handleApiError(err);
    }
  });
</script>

<section
  class="flex flex-col items-center justify-center h-full text-white text-center space-y-6 px-6"
>
  <span class="flex">
    <img class="h-20 pr-4" src="/IconSpinning.svg" alt="logo" />
    <img class="h-20" src="/LogoBakedFont.svg" alt="logo" />
  </span>
  <p class="text-lg md:text-2xl opacity-75">
    The go-to platform for safe, reliable, real low-latency remote shocking.<br />
    <span class="font-semibold">{deviceCount}</span> people online right now.
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

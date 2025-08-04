<script lang="ts">
  import { page } from '$app/state';
  import { publicShockerSharesApi } from '$lib/api';
  import type { PublicShareResponse } from '$lib/api/internal/v1';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
  import SharedDevice from './SharedDevice.svelte';

  let details = $state<PublicShareResponse | null>(null);

  // Fetch share details
  $effect(() => {
    const shareId = page.params.shareId;
    if (!shareId) return;

    publicShockerSharesApi
      .publicGetPublicShare(shareId)
      .then((res) => (details = res.data))
      .catch(handleApiError);
  });
</script>

{#if details}
  Editing share "{details.name}"
  {#each details.devices ?? [] as device}
    <SharedDevice {device} />
  {/each}
{/if}

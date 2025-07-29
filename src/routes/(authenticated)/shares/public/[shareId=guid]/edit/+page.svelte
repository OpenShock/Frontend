<script lang="ts">
  import { Pause, Play } from '@lucide/svelte';
  import { page } from '$app/state';
  import { publicShockerSharesApi } from '$lib/api';
  import type { PublicShareResponse } from '$lib/api/internal/v1';
  import { Button } from '$lib/components/ui/button';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';

  let details = $state<PublicShareResponse>();

  $effect(() => {
    let shareId = page.params.shareId;
    if (shareId === undefined) return;

    publicShockerSharesApi
      .publicGetPublicShare(shareId)
      .then((response) => (details = response.data))
      .catch(handleApiError);
  });
</script>

<ul>
  {#each details?.devices ?? [] as device}
    {#each device.shockers ?? [] as shocker}
      <li class="m-2 flex items-center gap-2">
        <Button>
          <Pause />
          <Play />
        </Button>
        {shocker.name}
        <div class="flex-1"></div>
        <Button>Shock</Button>
        <Button>Vibrate</Button>
        <Button>Sound</Button>
        <Button>Remove</Button>
      </li>
    {/each}
  {/each}
</ul>

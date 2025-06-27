<script lang="ts">
  import { Pause, Play } from '@lucide/svelte';
  import { page } from '$app/state';
  import { publicShockerSharesApi } from '$lib/api';
  import type { PublicShareResponse } from '$lib/api/internal/v1';
  import { Button } from '$lib/components/ui/button';
  import { onMount } from 'svelte';

  let shareId = $derived(page.params.shareId);

  let details = $state<PublicShareResponse>();

  onMount(() => {
    publicShockerSharesApi.publicGetPublicShare(shareId).then((response) => {
      details = response.data;
      console.log(response);
    });
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

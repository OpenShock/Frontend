<script lang="ts">
  import { Pause, Play } from '@lucide/svelte';
  import { publicShockerSharesApi } from '$lib/api';
  import type { OwnPublicShareResponse } from '$lib/api/internal/v1';
  import type { PublicShareResponse } from '$lib/api/internal/v1';
  import { Button } from '$lib/components/ui/button';
  import * as Dialog from '$lib/components/ui/dialog';
  import { onMount } from 'svelte';

  type Props = {
    open: boolean;
    publicShare: OwnPublicShareResponse;
  };

  let { open = $bindable<boolean>(), publicShare }: Props = $props();

  let details = $state<PublicShareResponse>();

  onMount(() => {
    publicShockerSharesApi.publicGetPublicShare(publicShare.id).then((response) => {
      details = response.data;
      console.log(response);
    });
  });
</script>

<Dialog.Root bind:open={() => open, (o) => (open = o)}>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>Edit PublicShare {details?.name}</Dialog.Title>
    </Dialog.Header>
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
    <Button>Add</Button>
  </Dialog.Content>
</Dialog.Root>

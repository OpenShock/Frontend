<script lang="ts">
  import type { PublicShareResponse } from '$lib/api/internal/v1';
  import PublicShareClassicControlModule from '$lib/components/ControlModules/PublicShareClassicControlModule.svelte';
  import { ShareLinkSignalr } from '$lib/sharelink-signalr/index.svelte';
  import type { Control } from '$lib/signalr/models/Control';
  import { onMount } from 'svelte';

  interface Props {
    shareLinkRoot: PublicShareResponse;
    guestName: string | null;
  }

  const { shareLinkRoot, guestName }: Props = $props();

  const shareLinkSignalr = new ShareLinkSignalr(shareLinkRoot.id, guestName);

  onMount(() => {
    shareLinkSignalr.initializeSignalR();

    return () => {
      shareLinkSignalr.destroySignalR();
    };
  });

  function control(control: Control) {
    shareLinkSignalr.control([control]);
  }
</script>

<div class="flex flex-col items-center">
  <div>
    <h1>Share: "{shareLinkRoot.name}"</h1>
    <p>{shareLinkSignalr.getState()}</p>
  </div>

  <div class="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
    {#each shareLinkRoot.devices!.flatMap((device) => device.shockers) as shocker (shocker.id)}
      <PublicShareClassicControlModule {shocker} {control} />
    {/each}
  </div>
</div>

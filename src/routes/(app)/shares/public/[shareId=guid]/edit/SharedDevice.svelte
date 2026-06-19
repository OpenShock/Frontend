<script lang="ts">
  import type { PublicShareDevice } from '$lib/api';
  import SharedShocker from './SharedShocker.svelte';

  interface Props {
    shareId: string;
    device: PublicShareDevice;
    onShockerRemoved?: (shockerId: string) => void;
  }

  let { shareId, device = $bindable(), onShockerRemoved }: Props = $props();
</script>

<section class="flex flex-col gap-3">
  <div class="flex items-center gap-3 px-1">
    <h2 class="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
      {device.name}
    </h2>
    <span class="bg-border h-px flex-1"></span>
  </div>
  <div class="flex flex-row flex-wrap justify-center gap-5">
    {#each device.shockers ?? [] as shocker, i (shocker.id)}
      <SharedShocker {shareId} bind:shocker={device.shockers[i]} onRemoved={onShockerRemoved} />
    {/each}
  </div>
</section>

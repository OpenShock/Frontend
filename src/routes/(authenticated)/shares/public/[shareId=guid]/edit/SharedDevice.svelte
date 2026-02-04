<script lang="ts">
  import type { PublicShareDevice } from '$lib/api/internal/v1';
  import SharedShocker from './SharedShocker.svelte';

  interface Props {
    shareId: string;
    device: PublicShareDevice;
    onShockerRemoved?: (shockerId: string) => void;
  }

  let { shareId, device = $bindable(), onShockerRemoved }: Props = $props();
</script>

<section class="mt-6">
  <h2 class="mb-4 text-2xl font-semibold">{device.name}</h2>
  <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
    {#each device.shockers ?? [] as shocker, i (shocker.id)}
      <SharedShocker {shareId} bind:shocker={device.shockers[i]} onRemoved={onShockerRemoved} />
    {/each}
  </div>
</section>

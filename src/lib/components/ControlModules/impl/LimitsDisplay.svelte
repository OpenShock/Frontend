<script lang="ts">
  import { ClockFading, Gauge } from '@lucide/svelte';

  interface Props {
    maxIntensity: number;
    maxDuration: number;
  }

  let { maxIntensity, maxDuration }: Props = $props();
</script>

<div class="text-muted-foreground flex gap-3 text-xs">
  <span class="flex items-center gap-1" title="Max Intensity">
    <Gauge size={14} />
    {maxIntensity}%
  </span>
  <span class="flex items-center gap-1" title="Max Duration">
    <ClockFading size={14} />
    {maxDuration}s
  </span>
</div>

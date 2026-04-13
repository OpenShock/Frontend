<script lang="ts">
  import { ClockFading, Gauge } from '@lucide/svelte';

  interface Props {
    maxIntensity: number;
    maxDurationSeconds: number;
  }

  let { maxIntensity, maxDurationSeconds }: Props = $props();
</script>

<div class="text-muted-foreground flex gap-3 text-xs">
  <span class="flex items-center gap-1" title="Max Intensity">
    <Gauge size={14} />
    {maxIntensity}%
  </span>
  <span class="flex items-center gap-1" title="Max Duration">
    <ClockFading size={14} />
    {maxDurationSeconds}s
  </span>
</div>

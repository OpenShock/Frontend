<script lang="ts">
  import { m } from '#lib/paraglide/messages.js';
  import { ClockFading, Gauge } from '@lucide/svelte';
  import { formatDurationSeconds } from '@openshock/svelte-core/utils';

  interface Props {
    maxIntensity: number;
    maxDuration: number;
  }

  let { maxIntensity, maxDuration }: Props = $props();
</script>

<div class="text-muted-foreground flex gap-3 text-xs">
  <span class="flex items-center gap-1" title={m.control_max_intensity()}>
    <Gauge size={14} />
    {maxIntensity}%
  </span>
  <span class="flex items-center gap-1" title={m.control_max_duration()}>
    <ClockFading size={14} />
    {formatDurationSeconds(maxDuration)}
  </span>
</div>

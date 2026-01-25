<script lang="ts">
  import { ChartNoAxesGantt, ClockFading, Gauge, Volume2, Waves, Zap } from '@lucide/svelte';
  import type { ShockerPermLimitPairWithIdAndName } from '$lib/api/internal/v2';
  import Badge from '$lib/components/ui/badge/badge.svelte';
  import { getPauseReason } from '$lib/utils';
  import type { ClassValue } from 'svelte/elements';

  interface Props {
    permAndLimits: ShockerPermLimitPairWithIdAndName;
    pauseState?: number;
  }

  let { permAndLimits: shockerShare, pauseState }: Props = $props();

  function permClass(enabled: boolean): ClassValue {
    let base = 'p-1 rounded-lg ';
    return base + (enabled ? 'bg-green-500' : 'bg-red-500');
  }

  let pausedReason = $derived(pauseState ? getPauseReason(pauseState) : null);
</script>

<div class="flex flex-col gap-2">
  <div class="flex gap-2 justify-center">
    {#if pausedReason}
      <Badge variant="destructive" class="w-max">Paused at {pausedReason} Level</Badge>
    {/if}
  </div>
  <div class="flex gap-2">
    <span class={permClass(shockerShare.permissions.shock)}>
      <Zap color="white" />
    </span>
    <span class={permClass(shockerShare.permissions.vibrate)}>
      <Waves color="white" />
    </span>
    <span class={permClass(shockerShare.permissions.sound)}>
      <Volume2 color="white" />
    </span>
    <span class={permClass(shockerShare.permissions.live!)}>
      <ChartNoAxesGantt color="white" />
    </span>
  </div>
  <div class="flex gap-2 justify-center">
    <span class="text-sm"><Gauge />{shockerShare.limits.intensity ?? 100}%</span>
    <span class="text-sm"><ClockFading />{(shockerShare.limits.duration ?? 30_000) / 1000}s</span>
  </div>
</div>

<script lang="ts">
  import type { ShockerResponse } from '$lib/api/internal/v1';
  import {
    ControlDurationDefault,
    ControlIntensityDefault,
    ControlDurationProps,
    ControlIntensityProps,
  } from '$lib/constants/ControlConstants';
  import { SignalR_Connection } from '$lib/signalr';
  import { ControlType } from '$lib/signalr/models/ControlType';
  import { serializeControlMessages } from '$lib/signalr/serializers/Control';

  import { Signal, Timer } from '@lucide/svelte';
  import ActionButtons from './Internal/ActionButtons.svelte';

  interface Props {
    shocker: ShockerResponse;
  }

  let { shocker }: Props = $props();

  let intensity = $state(ControlIntensityDefault);
  let duration = $state(ControlDurationDefault);

  function ctrl(type: ControlType) {
    if (!$SignalR_Connection) return;
    serializeControlMessages($SignalR_Connection, [{ id: shocker.id, type, intensity, duration }]);
  }
</script>

<div
  class="border-surface-400-500-token flex flex-col items-center justify-center gap-2 overflow-hidden rounded-md border p-2"
>
  <!-- Title -->
  <h2 class="w-full truncate px-4 text-center text-lg font-bold">{shocker.name}</h2>
  <!-- Sliders -->
  <div class="grid grid-cols-[24px_128px_40px] items-center gap-1 text-center">
    <Signal />
    <input type="range" bind:value={intensity} {...ControlIntensityProps} />
    <p>{intensity}%</p>
    <Timer />
    <input type="range" bind:value={duration} {...ControlDurationProps} />
    <p>{duration}s</p>
  </div>
  <!-- Buttons -->
  <ActionButtons {ctrl} />
</div>

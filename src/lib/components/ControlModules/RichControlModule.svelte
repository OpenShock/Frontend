<script lang="ts">
  import type { ShockerResponse } from '$lib/api/internal/v1';
  import { Button } from '$lib/components/ui/button';
  import {
    ControlDurationDefault,
    ControlIntensityDefault,
    ControlDurationProps,
    ControlIntensityProps,
  } from '$lib/constants/ControlConstants';
  import { SignalR_Connection } from '$lib/signalr';
  import { ControlType } from '$lib/signalr/models/ControlType';
  import { serializeControlMessages } from '$lib/signalr/serializers/Control';

  import { Signal, Timer, Volume2, Waves, Zap } from '@lucide/svelte';

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
  <div class="flex w-full gap-2">
    <!-- Beep button -->
    <Button
      variant="secondary"
      class="flex-1 cursor-pointer"
      aria-label="Beep"
      onclick={() => ctrl(ControlType.Sound)}
    >
      <Volume2 />
    </Button>
    <!-- Vibrate button -->
    <Button
      variant="secondary"
      class="flex-1 cursor-pointer"
      aria-label="Vibrate"
      onclick={() => ctrl(ControlType.Vibrate)}
    >
      <Waves />
    </Button>
    <!-- Shock button -->
    <Button
      variant="secondary"
      class="flex-1 cursor-pointer"
      aria-label="Shock"
      onclick={() => ctrl(ControlType.Shock)}
    >
      <Zap />
    </Button>
  </div>
</div>

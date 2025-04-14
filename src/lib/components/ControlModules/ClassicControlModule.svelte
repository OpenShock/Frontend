<script lang="ts">
  import type { ShockerResponse } from '$lib/api/internal/v1';
  import { Button } from '$lib/components/ui/button';
  import { ControlDurationDefault, ControlIntensityDefault, ControlIntensityProps, ControlDurationProps } from '$lib/constants/ControlConstants';
  import { SignalR_Connection } from '$lib/signalr';
  import { ControlType } from '$lib/signalr/models/ControlType';
  import { serializeControlMessages } from '$lib/signalr/serializers/Control';
  import CircleSlider from './Internal/CircleSlider.svelte';

  import { Volume2, Waves, Zap } from '@lucide/svelte';

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
  class="border-surface-400-500-token flex flex-col items-center justify-center gap-2 rounded-md border p-2"
>
  <!-- Title -->
  <h2 class="text-lg font-bold">{shocker.name}</h2>
  <!-- Sliders -->
  <div class="flex items-center gap-2">
    <CircleSlider name="Intensity" bind:value={intensity} {...ControlIntensityProps} />
    <CircleSlider name="Duration" bind:value={duration} {...ControlDurationProps} />
  </div>
  <!-- Buttons -->
  <div class="flex w-full gap-2">
    <!-- Beep button -->
    <Button
      variant="secondary"
      class="flex-1"
      aria-label="Beep"
      onclick={() => ctrl(ControlType.Sound)}
    >
      <Volume2 />
    </Button>
    <!-- Vibrate button -->
    <Button
      variant="secondary"
      class="flex-1"
      aria-label="Vibrate"
      onclick={() => ctrl(ControlType.Vibrate)}
    >
      <Waves />
    </Button>
    <!-- Shock button -->
    <Button
      variant="secondary"
      class="flex-1"
      aria-label="Shock"
      onclick={() => ctrl(ControlType.Shock)}
    >
      <Zap />
    </Button>
  </div>
</div>

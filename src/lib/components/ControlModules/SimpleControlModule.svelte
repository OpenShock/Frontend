<script lang="ts">
  import type { ShockerResponse } from '$lib/api/internal/v1';
  import { Button } from '$lib/components/ui/button';
  import { SignalR_Connection } from '$lib/signalr';
  import { ControlType } from '$lib/signalr/models/ControlType';
  import { serializeControlMessages } from '$lib/signalr/serializers/Control';

  import { Volume2, Waves, Zap } from '@lucide/svelte';

  interface Props {
    shocker: ShockerResponse;
    shockIntensity: number;
    vibrationIntensity: number;
    duration: number;
  }

  let { shocker, shockIntensity, vibrationIntensity, duration }: Props = $props();

  function ctrl(type: ControlType) {
    let intensity: number;
    switch (type) {
      case ControlType.Stop:
        intensity = 0;
        break;
      case ControlType.Shock:
        intensity = shockIntensity;
        break;
      case ControlType.Vibrate:
        intensity = vibrationIntensity;
        break;
      case ControlType.Sound:
        intensity = 0;
        break;
      default:
        return;
    }

    if (!$SignalR_Connection) return;
    serializeControlMessages($SignalR_Connection, [{ id: shocker.id, type, intensity, duration }]);
  }
</script>

<div
  class="border-surface-400-500-token flex flex-col items-center justify-center gap-2 overflow-hidden rounded-md border p-2"
>
  <!-- Title -->
  <h2 class="w-full truncate px-4 text-center text-lg font-bold">{shocker.name}</h2>
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
      class="flex-1  cursor-pointer"
      aria-label="Shock"
      onclick={() => ctrl(ControlType.Shock)}
    >
      <Zap />
    </Button>
  </div>
</div>

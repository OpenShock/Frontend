<script lang="ts">
  import type { ShockerResponse } from '$lib/api/internal/v1';
  import { SignalR_Connection } from '$lib/signalr';
  import { ControlType } from '$lib/signalr/models/ControlType';
  import { serializeControlMessages } from '$lib/signalr/serializers/Control';
  import ControlListener, { type ShockerState } from './ControlListener.svelte';
  import ActionButtons from './impl/ActionButtons.svelte';

  interface Props {
    shocker: ShockerResponse;
    shockIntensity: number;
    vibrationIntensity: number;
    duration: number;
    disabled?: boolean;
  }

  let { shocker, shockIntensity, vibrationIntensity, duration, disabled }: Props = $props();

  let shockerState = $state<ShockerState>({ active: null, intensity: 0, duration: 0 });

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

<ControlListener shockerId={shocker.id} bind:state={shockerState} />

<div
  class="border-surface-400-500-token flex flex-col items-center justify-center gap-2 overflow-hidden rounded-md border p-2"
>
  <!-- Title -->
  <h2 class="w-full truncate px-4 text-center text-lg font-bold">{shocker.name}</h2>
  <!-- Buttons -->
  <ActionButtons {ctrl} {duration} active={shockerState.active} {disabled} />
</div>

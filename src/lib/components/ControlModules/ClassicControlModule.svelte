<script lang="ts">
  import type { ShockerResponse } from '$lib/api/internal/v1';
  import {
    ControlDurationDefault,
    ControlDurationProps,
    ControlIntensityDefault,
    ControlIntensityProps,
  } from '$lib/constants/ControlConstants';
  import { SignalR_Connection } from '$lib/signalr';
  import { ControlType } from '$lib/signalr/models/ControlType';
  import { serializeControlMessages } from '$lib/signalr/serializers/Control';
  import ControlListener from './ControlListener.svelte';
  import ActionButtons from './impl/ActionButtons.svelte';
  import CircleSlider from './impl/CircleSlider.svelte';
  import ShockerMenu from './impl/ShockerMenu.svelte';

  interface Props {
    shocker: ShockerResponse;
    disabled?: boolean;
  }

  let { shocker, disabled }: Props = $props();

  let intensity = $state(ControlIntensityDefault);
  let duration = $state(ControlDurationDefault);
  let active = $state<ControlType | null>(null);

  function ctrl(type: ControlType) {
    if (!$SignalR_Connection) return;
    serializeControlMessages($SignalR_Connection, [{ id: shocker.id, type, intensity, duration }]);
  }
</script>

<ControlListener shockerId={shocker.id} bind:active />

<div
  class="border-surface-400-500-token flex flex-col items-center justify-center gap-2 overflow-hidden rounded-md border p-2"
>
  <!-- Title -->
  <h2 class="w-full truncate px-4 text-center text-lg font-bold flex justify-between">
    <span>
      {shocker.name}
    </span>
    <ShockerMenu {shocker} />
  </h2>
  <!-- Sliders -->
  <div class="flex items-center gap-2">
    <CircleSlider name="Intensity" bind:value={intensity} {...ControlIntensityProps} />
    <CircleSlider name="Duration" bind:value={duration} {...ControlDurationProps} />
  </div>
  <!-- Buttons -->
  <ActionButtons {ctrl} {duration} {active} {disabled} />
</div>

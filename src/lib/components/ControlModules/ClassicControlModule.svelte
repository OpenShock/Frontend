<script lang="ts">
  import type { ShockerResponse } from '$lib/api/internal/v1';
  import {
    ControlDurationDefault,
    ControlIntensityDefault,
    ControlIntensityProps,
    ControlDurationProps,
  } from '$lib/constants/ControlConstants';
  import { SignalR_Connection } from '$lib/signalr';
  import { ControlType } from '$lib/signalr/models/ControlType';
  import { serializeControlMessages } from '$lib/signalr/serializers/Control';
  import ActionButton from './Internal/ActionButton.svelte';
  import CircleSlider from './Internal/CircleSlider.svelte';

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
  <div class="flex items-center gap-2">
    <CircleSlider name="Intensity" bind:value={intensity} {...ControlIntensityProps} />
    <CircleSlider name="Duration" bind:value={duration} {...ControlDurationProps} />
  </div>
  <!-- Buttons -->
  <div class="flex w-full gap-2">
    <ActionButton {ctrl} type={ControlType.Sound} />
    <ActionButton {ctrl} type={ControlType.Vibrate} />
    <ActionButton {ctrl} type={ControlType.Shock} />
  </div>
</div>

<script lang="ts">
  import type { PublicShareShocker } from '$lib/api/internal/v1';
  import {
    ControlDurationDefault,
    ControlDurationProps,
    ControlIntensityDefault,
    ControlIntensityProps,
  } from '$lib/constants/ControlConstants';
  import type { Control } from '$lib/signalr/models/Control';
  import { ControlType } from '$lib/signalr/models/ControlType';
  import ControlListener from './ControlListener.svelte';
  import ActionButtons from './impl/ActionButtons.svelte';
  import CircleSlider from './impl/CircleSlider.svelte';

  interface Props {
    shocker: PublicShareShocker;
    disabled?: boolean;
    control: (type: Control) => void;
  }

  let { shocker, disabled, control }: Props = $props();

  let intensity = $state(ControlIntensityDefault);
  let duration = $state(ControlDurationDefault);
  let active = $state<ControlType | null>(null);

  function ctrl(type: ControlType) {
    control({ id: shocker.id, type, intensity, duration });
  }
</script>

<ControlListener shockerId={shocker.id} bind:active />

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
  <ActionButtons {ctrl} {duration} {active} {disabled} />
</div>

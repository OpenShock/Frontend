<script lang="ts">
  import { Timer, Volume2, Zap } from '@lucide/svelte';
  import { ControlDurationProps, ControlIntensityProps } from '$lib/constants/ControlConstants';
  import CircleSlider from './impl/CircleSlider.svelte';

  interface Props {
    shockIntensity: number;
    vibrationIntensity: number;
    duration: number;
  }

  let {
    shockIntensity = $bindable(),
    vibrationIntensity = $bindable(),
    duration = $bindable(),
  }: Props = $props();
</script>

<div
  class="border-surface-400-500-token flex flex-row items-center justify-center gap-16 rounded-md border px-8 py-2"
>
  <!-- Sliders -->
  <div class="grid flex-1 grid-cols-[24px_auto_40px] items-center gap-1 text-center">
    <Zap />
    <input type="range" bind:value={shockIntensity} {...ControlIntensityProps} />
    <p>{shockIntensity}%</p>
    <Volume2 />
    <input type="range" bind:value={vibrationIntensity} {...ControlIntensityProps} />
    <p>{vibrationIntensity}%</p>
    <Timer />
    <input type="range" bind:value={duration} {...ControlDurationProps} />
    <p>{duration}s</p>
  </div>
  <div class="flex flex-1 flex-row justify-between">
    <CircleSlider name="Shock" bind:value={shockIntensity} {...ControlIntensityProps} />
    <CircleSlider name="Vibration" bind:value={vibrationIntensity} {...ControlIntensityProps} />
    <CircleSlider name="Duration" bind:value={duration} {...ControlDurationProps} />
  </div>
</div>

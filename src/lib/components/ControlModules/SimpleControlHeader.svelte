<script lang="ts">
  import CircleSlider from './Internal/CircleSlider.svelte';

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
    <i class="fa-solid fa-bolt"></i>
    <input type="range" bind:value={shockIntensity} min="0" max="100" step="1" />
    <p>{shockIntensity}%</p>
    <i class="fa-solid fa-volume-high"></i>
    <input type="range" bind:value={vibrationIntensity} min="0" max="100" step="1" />
    <p>{vibrationIntensity}%</p>
    <i class="fa-solid fa-stopwatch"></i>
    <input type="range" bind:value={duration} min="0.3" max="30" step="0.3" />
    <p>{duration}s</p>
  </div>
  <div class="flex flex-1 flex-row justify-between">
    <CircleSlider name="Shock" bind:value={shockIntensity} min={0} max={100} step={1} />
    <CircleSlider name="Vibration" bind:value={vibrationIntensity} min={0} max={100} step={1} />
    <CircleSlider name="Duration" bind:value={duration} min={0.3} max={30} step={0.3} />
  </div>
</div>

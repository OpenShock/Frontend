<script lang="ts">
  import CircleSlider from "./Internal/CircleSlider.svelte";

  let shockIntensity: number = 25;
  let vibrationIntensity: number = 25;
  let duration: number = 1;
</script>

<div
  class="flex flex-row items-center justify-center gap-2 p-2 border border-surface-400-500-token rounded-md"
>
  <!-- Sliders -->
  <div class="grid grid-cols-[24px_auto_40px] gap-1 items-center text-center">
    <i class="fa-solid fa-bolt" />
    <input type="range" bind:value={shockIntensity} min="0" max="100" step="1" />
    <p>{shockIntensity}%</p>
    <i class="fa-solid fa-volume-high" />
    <input type="range" bind:value={vibrationIntensity} min="0" max="100" step="1" />
    <p>{vibrationIntensity}%</p>
    <i class="fa-solid fa-stopwatch" />
    <input type="range" bind:value={duration} min="0.3" max="30" step="0.3" />
    <p>{duration}s</p>
  </div>
  <CircleSlider name="Shock" bind:value={shockIntensity} min={0} max={100} step={1} />
  <CircleSlider name="Vibration" bind:value={vibrationIntensity} min={0} max={100} step={1} />
  <CircleSlider name="Duration" bind:value={duration} min={0.3} max={30} step={0.1} />
</div>

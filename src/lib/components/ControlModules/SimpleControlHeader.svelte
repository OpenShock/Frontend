<script lang="ts">
  import CircleSlider from './Internal/CircleSlider.svelte';

  let shockIntensity = $state(25);
  let vibrationIntensity = $state(25);
  let duration = $state(1);
</script>

<div
  class="border-surface-400-500-token flex flex-row items-center justify-center gap-2 rounded-md border p-2"
>
  <!-- Sliders -->
  <div class="grid grid-cols-[24px_auto_40px] items-center gap-1 text-center">
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
  <CircleSlider name="Shock" bind:value={shockIntensity} min={0} max={100} step={1} />
  <CircleSlider name="Vibration" bind:value={vibrationIntensity} min={0} max={100} step={1} />
  <CircleSlider name="Duration" bind:value={duration} min={0.3} max={30} step={0.1} />
</div>

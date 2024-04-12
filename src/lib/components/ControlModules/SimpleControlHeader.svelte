<script lang="ts">
  let intensity: number = 25;
  let duration: number = 1;
</script>

<div
  class="flex flex-col items-center justify-center gap-2 p-2 border border-surface-400-500-token rounded-md"
>
  <!-- Sliders -->
  <div class="grid grid-cols-[24px_auto_40px] gap-1 items-center text-center">
    <i class="fa-solid fa-signal" />
    <input type="range" bind:value={intensity} min="0" max="100" step="1" />
    <p>{intensity}%</p>
    <i class="fa-solid fa-stopwatch" />
    <input type="range" bind:value={duration} min="0.3" max="30" step="0.3" />
    <p>{duration}s</p>
  </div>
</div>

<script lang="ts">
  import type { ShockerResponse } from '$lib/api/internal/v1';
  import { createEventDispatcher } from 'svelte';

  export let shocker: ShockerResponse;

  let intensity: number = 25;
  let duration: number = 1;

  const dispatch = createEventDispatcher();

  function emit(type: string) {
    dispatch('command', { id: shocker.id, type, intensity, duration });
  }
</script>

<div
  class="flex flex-col items-center justify-center gap-2 p-2 border border-surface-400-500-token rounded-md"
>
  <!-- Title -->
  <h2 class="text-lg font-bold">{shocker.name}</h2>
  <!-- Sliders -->
  <div class="grid grid-cols-[24px_128px_40px] gap-1 items-center text-center">
    <i class="fa-solid fa-signal" />
    <input type="range" bind:value={intensity} min="0" max="100" step="1" />
    <p>{intensity}%</p>
    <i class="fa-solid fa-stopwatch" />
    <input type="range" bind:value={duration} min="0.3" max="30" step="0.3" />
    <p>{duration}s</p>
  </div>
  <!-- Buttons -->
  <div class="w-full flex gap-2">
    <!-- Beep button -->
    <button class="btn p-2 bg-primary-500 rounded-md flex-1" on:click={() => emit('beep')}>
      <i class="fa-solid fa-volume-high" />
    </button>
    <!-- Vibrate button -->
    <button class="btn p-2 bg-primary-500 rounded-md flex-1" on:click={() => emit('vibrate')}>
      <i class="fa-solid fa-water" />
    </button>
    <!-- Shock button -->
    <button class="btn p-2 bg-primary-500 rounded-md flex-1" on:click={() => emit('shock')}>
      <i class="fa-solid fa-bolt" />
    </button>
  </div>
</div>

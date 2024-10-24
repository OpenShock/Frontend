<script lang="ts">
  import type { ShockerResponse } from '$lib/api/internal/v1';
  import { createEventDispatcher } from 'svelte';

  interface Props {
    shocker: ShockerResponse;
  }

  let { shocker }: Props = $props();

  let intensity: number = $state(25);
  let duration: number = $state(1);

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
    <i class="fa-solid fa-signal"></i>
    <input type="range" bind:value={intensity} min="0" max="100" step="1" />
    <p>{intensity}%</p>
    <i class="fa-solid fa-stopwatch"></i>
    <input type="range" bind:value={duration} min="0.3" max="30" step="0.3" />
    <p>{duration}s</p>
  </div>
  <!-- Buttons -->
  <div class="w-full flex gap-2">
    <!-- Beep button -->
    <button class="btn p-2 bg-primary-500 rounded-md flex-1" onclick={() => emit('beep')}>
      <i class="fa-solid fa-volume-high"></i>
    </button>
    <!-- Vibrate button -->
    <button class="btn p-2 bg-primary-500 rounded-md flex-1" onclick={() => emit('vibrate')}>
      <i class="fa-solid fa-water"></i>
    </button>
    <!-- Shock button -->
    <button class="btn p-2 bg-primary-500 rounded-md flex-1" onclick={() => emit('shock')}>
      <i class="fa-solid fa-bolt"></i>
    </button>
  </div>
</div>

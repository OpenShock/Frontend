<script lang="ts">
  import type { ShockerResponse } from '$lib/api/internal/v1';
  import { createEventDispatcher } from 'svelte';

  interface Props {
    shocker: ShockerResponse;
  }

  let { shocker }: Props = $props();

  let intensity = $state(25);
  let duration = $state(1);

  const dispatch = createEventDispatcher();

  function emit(type: string) {
    dispatch('command', { id: shocker.id, type, intensity, duration });
  }
</script>

<div
  class="border-surface-400-500-token flex flex-col items-center justify-center gap-2 rounded-md border p-2"
>
  <!-- Title -->
  <h2 class="text-lg font-bold">{shocker.name}</h2>
  <!-- Sliders -->
  <div class="grid grid-cols-[24px_128px_40px] items-center gap-1 text-center">
    <i class="fa-solid fa-signal"></i>
    <input type="range" bind:value={intensity} min="0" max="100" step="1" />
    <p>{intensity}%</p>
    <i class="fa-solid fa-stopwatch"></i>
    <input type="range" bind:value={duration} min="0.3" max="30" step="0.3" />
    <p>{duration}s</p>
  </div>
  <!-- Buttons -->
  <div class="flex w-full gap-2">
    <!-- Beep button -->
    <button
      class="btn bg-primary-500 flex-1 rounded-md p-2"
      onclick={() => emit('beep')}
      aria-label="Beep"
    >
      <i class="fa-solid fa-volume-high"></i>
    </button>
    <!-- Vibrate button -->
    <button
      class="btn bg-primary-500 flex-1 rounded-md p-2"
      onclick={() => emit('vibrate')}
      aria-label="Vibrate"
    >
      <i class="fa-solid fa-water"></i>
    </button>
    <!-- Shock button -->
    <button
      class="btn bg-primary-500 flex-1 rounded-md p-2"
      onclick={() => emit('shock')}
      aria-label="Shock"
    >
      <i class="fa-solid fa-bolt"></i>
    </button>
  </div>
</div>

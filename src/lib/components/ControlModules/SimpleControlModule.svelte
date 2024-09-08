<script lang="ts">
  import type { ShockerResponse } from '$lib/api/internal/v1';
  import { createEventDispatcher } from 'svelte';

  export let shocker: ShockerResponse;

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

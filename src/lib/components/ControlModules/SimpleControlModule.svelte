<script lang="ts">
  import type { ShockerResponse } from '$lib/api/internal/v1';
  import { createEventDispatcher } from 'svelte';

  interface Props {
    shocker: ShockerResponse;
  }

  let { shocker }: Props = $props();

  const dispatch = createEventDispatcher();

  function emit(type: string) {
    dispatch('command', { id: shocker.id, type }); // TODO: What to do with intensity and duration?
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
    <button
      class="btn p-2 bg-primary-500 rounded-md flex-1"
      onclick={() => emit('beep')}
      aria-label="Beep"
    >
      <i class="fa-solid fa-volume-high"></i>
    </button>
    <!-- Vibrate button -->
    <button
      class="btn p-2 bg-primary-500 rounded-md flex-1"
      onclick={() => emit('vibrate')}
      aria-label="Vibrate"
    >
      <i class="fa-solid fa-water"></i>
    </button>
    <!-- Shock button -->
    <button
      class="btn p-2 bg-primary-500 rounded-md flex-1"
      onclick={() => emit('shock')}
      aria-label="Shock"
    >
      <i class="fa-solid fa-bolt"></i>
    </button>
  </div>
</div>

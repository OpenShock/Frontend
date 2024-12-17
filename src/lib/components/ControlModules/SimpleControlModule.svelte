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
  class="border-surface-400-500-token flex flex-col items-center justify-center gap-2 rounded-md border p-2"
>
  <!-- Title -->
  <h2 class="text-lg font-bold">{shocker.name}</h2>
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

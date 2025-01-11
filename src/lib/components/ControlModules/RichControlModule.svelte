<script lang="ts">
  import type { ShockerResponse } from '$lib/api/internal/v1';
  import { ControlType, type Control } from '$lib/api/internal/v2';
  import { Button } from '$lib/components/ui/button';

  import { Signal, Timer, Volume2, Waves, Zap } from 'lucide-svelte';

  interface Props {
    shocker: ShockerResponse;
    controlHandler: (controls: Control[]) => void;
  }

  let { shocker, controlHandler }: Props = $props();

  let intensity = $state(25);
  let duration = $state(1);

  function ctrl(type: ControlType) {
    controlHandler([{ id: shocker.id, type, intensity, duration }]);
  }
</script>

<div
  class="border-surface-400-500-token flex flex-col items-center justify-center gap-2 rounded-md border p-2"
>
  <!-- Title -->
  <h2 class="text-lg font-bold">{shocker.name}</h2>
  <!-- Sliders -->
  <div class="grid grid-cols-[24px_128px_40px] items-center gap-1 text-center">
    <Signal />
    <input type="range" bind:value={intensity} min="0" max="100" step="1" />
    <p>{intensity}%</p>
    <Timer />
    <input type="range" bind:value={duration} min="0.3" max="30" step="0.3" />
    <p>{duration}s</p>
  </div>
  <!-- Buttons -->
  <div class="flex w-full gap-2">
    <!-- Beep button -->
    <Button
      variant="secondary"
      class="flex-1"
      aria-label="Beep"
      onclick={() => ctrl(ControlType.Sound)}
    >
      <Volume2 />
    </Button>
    <!-- Vibrate button -->
    <Button
      variant="secondary"
      class="flex-1"
      aria-label="Vibrate"
      onclick={() => ctrl(ControlType.Vibrate)}
    >
      <Waves />
    </Button>
    <!-- Shock button -->
    <Button
      variant="secondary"
      class="flex-1"
      aria-label="Shock"
      onclick={() => ctrl(ControlType.Shock)}
    >
      <Zap />
    </Button>
  </div>
</div>

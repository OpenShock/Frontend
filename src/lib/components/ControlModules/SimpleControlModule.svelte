<script lang="ts">
  import type { ShockerResponse } from '$lib/api/internal/v1';
  import { ControlType } from '$lib/api/internal/v2';
  import { Button } from '$lib/components/ui/button';

  import { Volume2, Waves, Zap } from '@lucide/svelte';

  interface Props {
    shocker: ShockerResponse;
    controlHandler: (shockerId: string, controlType: ControlType) => void;
  }

  let { shocker, controlHandler }: Props = $props();

  function ctrl(type: ControlType) {
    controlHandler(shocker.id, type);
  }
</script>

<div
  class="border-surface-400-500-token flex flex-col items-center justify-center gap-2 overflow-hidden rounded-md border p-2"
>
  <!-- Title -->
  <h2 class="truncate text-lg font-bold">{shocker.name}</h2>
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

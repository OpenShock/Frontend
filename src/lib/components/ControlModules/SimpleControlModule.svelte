<script lang="ts">
  import type { ShockerResponse } from '$lib/api/internal/v1';
  import { ControlType } from '$lib/api/internal/v2';
  import { Button } from '$lib/components/ui/button';

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
      <i class="fa-solid fa-volume-high"></i>
    </Button>
    <!-- Vibrate button -->
    <Button
      variant="secondary"
      class="flex-1"
      aria-label="Vibrate"
      onclick={() => ctrl(ControlType.Vibrate)}
    >
      <i class="fa-solid fa-water"></i>
    </Button>
    <!-- Shock button -->
    <Button
      variant="secondary"
      class="flex-1"
      aria-label="Shock"
      onclick={() => ctrl(ControlType.Shock)}
    >
      <i class="fa-solid fa-bolt"></i>
    </Button>
  </div>
</div>

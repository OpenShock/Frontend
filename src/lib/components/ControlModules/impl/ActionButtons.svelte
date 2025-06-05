<script lang="ts">
  import { Volume2, Waves, Zap } from '@lucide/svelte';
  import Button from '$lib/components/ui/button/button.svelte';
  import { ControlType } from '$lib/signalr/models/ControlType';

  interface Props {
    ctrl: (type: ControlType) => void;
  }

  let { ctrl }: Props = $props();
</script>

<div class="flex w-full gap-2">
  <Button
    variant="secondary"
    class="flex-1 cursor-pointer"
    aria-label="Sound"
    onclick={() => ctrl(ControlType.Sound)}
  >
    <Volume2 />
  </Button>
  <Button
    variant="secondary"
    class="flex-1 cursor-pointer"
    aria-label="Vibrate"
    onclick={() => ctrl(ControlType.Vibrate)}
  >
    <Waves />
  </Button>
  <Button
    variant="secondary"
    class="flex-1 cursor-pointer"
    aria-label="Shock"
    onclick={() => ctrl(ControlType.Shock)}
  >
    <Zap />
  </Button>
</div>

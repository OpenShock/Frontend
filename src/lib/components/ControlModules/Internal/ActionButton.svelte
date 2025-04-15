<script lang="ts">
  import Button from '$lib/components/ui/button/button.svelte';
  import { ControlType } from '$lib/signalr/models/ControlType';
  import { StopCircle, Volume2, Waves, Zap } from '@lucide/svelte';

  type Props = {
    ctrl: (type: ControlType) => void;
    type: ControlType;
  };

  let { type, ctrl }: Props = $props();
</script>

<Button
  variant="secondary"
  class="flex-1 cursor-pointer"
  aria-label={ControlType[type]}
  onclick={() => ctrl(type)}
>
  {#if type == ControlType.Stop}
    <StopCircle />
  {:else if type == ControlType.Shock}
    <Zap />
  {:else if type == ControlType.Vibrate}
    <Waves />
  {:else if type == ControlType.Sound}
    <Volume2 />
  {/if}
</Button>

<script lang="ts">
  import { Volume2, Waves, Zap } from '@lucide/svelte';
  import { buttonVariants } from '$lib/components/ui/button/button.svelte';
  import { ControlType } from '$lib/signalr/models/ControlType';
  import {
    type LiveShockerState,
    type LiveDeviceConnection,
  } from '$lib/state/live-control-state.svelte';
  import { cn } from '$lib/utils';
  import LiveSlider from './impl/LiveSlider.svelte';

  interface Props {
    shockerId: string;
    liveState: LiveShockerState;
    connection: LiveDeviceConnection;
  }

  let { shockerId, liveState, connection }: Props = $props();

  const types = [
    { type: ControlType.Sound, Icon: Volume2, label: 'Sound' },
    { type: ControlType.Vibrate, Icon: Waves, label: 'Vibrate' },
    { type: ControlType.Shock, Icon: Zap, label: 'Shock' },
  ] as const;

  const buttonClasses = buttonVariants({ variant: 'secondary', size: 'default' });
</script>

<!-- Type Selector -->
<div class="flex w-full gap-2">
  {#each types as { type, Icon, label } (type)}
    <button
      class={cn(buttonClasses, 'flex-1', {
        'border-primary bg-primary/20': liveState.type === type,
      })}
      title={label}
      aria-label={label}
      aria-pressed={liveState.type === type}
      onclick={() => (liveState.type = type)}
    >
      <Icon />
    </button>
  {/each}
</div>

<!-- Live Slider -->
<div class="h-[200px] w-full">
  <LiveSlider {liveState} onRelease={() => connection.sendFrame(shockerId, 0, liveState.type)} />
</div>

<script lang="ts">
  import { Volume2, Waves, Zap } from '@lucide/svelte';
  import { buttonVariants } from '@openshock/svelte-core/components/ui/button';
  import { controlTypeLabel } from '#lib/i18n/control-type.js';
  import { ControlType } from '#lib/signalr/models/ControlType.js';
  import {
    type LiveShockerState,
    type LiveDeviceConnection,
  } from '#lib/state/live-control-state.svelte.js';
  import { cn } from '@openshock/svelte-core/utils';
  import LiveSlider from './impl/LiveSlider.svelte';

  interface Props {
    shockerId: string;
    liveState: LiveShockerState;
    connection: LiveDeviceConnection;
  }

  let { shockerId, liveState, connection }: Props = $props();

  const types = [
    { type: ControlType.Sound, Icon: Volume2 },
    { type: ControlType.Vibrate, Icon: Waves },
    { type: ControlType.Shock, Icon: Zap },
  ] as const;

  const buttonClasses = buttonVariants({ variant: 'secondary', size: 'default' });
</script>

<!-- Type Selector -->
<div class="flex w-full gap-2">
  {#each types as { type, Icon } (type)}
    {@const label = controlTypeLabel(type)}
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

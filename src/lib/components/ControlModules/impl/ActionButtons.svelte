<script lang="ts">
  import { Loader, Volume2, Waves, Zap } from '@lucide/svelte';
  import { buttonVariants } from '$lib/components/ui/button/button.svelte';
  import { ControlType } from '$lib/signalr/models/ControlType';
  import type { TimeoutHandle } from '$lib/types/WAPI';
  import { cn } from '$lib/utils';
  import { onDestroy } from 'svelte';

  interface Props {
    ctrl: (type: ControlType) => void;
    duration: number;
    active?: ControlType | null;
    disabled?: boolean;
  }

  let { ctrl, duration, active, disabled }: Props = $props();

  let selfActive = $state<ControlType | null>(null);
  let timeoutHandle: TimeoutHandle | undefined;
  function trigger(type: ControlType) {
    clearTimeout(timeoutHandle);

    if (type === selfActive) {
      type = ControlType.Stop;
      selfActive = null;
    } else {
      selfActive = type;
      timeoutHandle = setTimeout(() => (selfActive = null), duration * 1000);
    }

    ctrl(type);
  }

  const Buttons = [
    { type: ControlType.Sound, Icon: Volume2 },
    { type: ControlType.Vibrate, Icon: Waves },
    { type: ControlType.Shock, Icon: Zap },
  ];

  const buttonClasses = buttonVariants({ variant: 'secondary', size: 'default' });

  onDestroy(() => clearTimeout(timeoutHandle));
</script>

<div>
  {#each Buttons as { type, Icon }}
    <button
      class={cn(buttonClasses, {
        active: type === active || type === selfActive,
      })}
      aria-label={ControlType[type]}
      onclick={() => trigger(type)}
      {disabled}
    >
      {#if type === selfActive}
        <Loader class="animate-spin" />
      {:else}
        <Icon />
      {/if}
    </button>
  {/each}
</div>

<style>
  div {
    display: flex;
    width: 100%;
    gap: 8px;
  }

  button {
    flex: 1;
    cursor: pointer;
    border-width: 2px;
  }

  button.active {
    animation: party 0.33s ease-in-out infinite;
  }

  @keyframes party {
    0% {
      border-color: #0dd;
      box-shadow: 0 0 8px #0dd;
    }
    50% {
      border-color: #07d;
      box-shadow: 0 0 8px #07d;
    }
    100% {
      border-color: #0dd;
      box-shadow: 0 0 8px #0dd;
    }
  }
</style>

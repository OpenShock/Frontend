<script lang="ts">
  import type { ShockerResponse } from '$lib/api/internal/v1';
  import { LoaderCircle, Pause, Play, Volume2, Waves, Zap } from '@lucide/svelte';
  import { shockersV1Api } from '$lib/api';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
  import { buttonVariants } from '$lib/components/ui/button/button.svelte';
  import { ControlType } from '$lib/signalr/models/ControlType';
  import {
    type LiveShockerState,
    type LiveDeviceConnection,
  } from '$lib/state/live-control-state.svelte';
  import { cn } from '$lib/utils';
  import LiveSlider from './impl/LiveSlider.svelte';
  import ShockerMenu from './impl/ShockerMenu.svelte';

  interface Props {
    shocker: ShockerResponse;
    liveState: LiveShockerState;
    connection: LiveDeviceConnection;
  }

  let { shocker, liveState, connection }: Props = $props();

  let resuming = $state(false);

  async function resume() {
    resuming = true;
    try {
      const result = await shockersV1Api.shockerPauseShocker(shocker.id, { pause: false });
      shocker.isPaused = result.data;
    } catch (error) {
      handleApiError(error);
    } finally {
      resuming = false;
    }
  }

  const types = [
    { type: ControlType.Sound, Icon: Volume2, label: 'Sound' },
    { type: ControlType.Vibrate, Icon: Waves, label: 'Vibrate' },
    { type: ControlType.Shock, Icon: Zap, label: 'Shock' },
  ] as const;

  const buttonClasses = buttonVariants({ variant: 'secondary', size: 'default' });
</script>

<div
  class="border-surface-400-500-token relative flex flex-col items-center justify-center gap-2 overflow-hidden rounded-md border p-2"
>
  {#if shocker.isPaused}
    <button
      class="group absolute inset-0 z-10 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md bg-black/60 backdrop-blur-sm transition-colors hover:bg-black/50"
      onclick={resume}
      disabled={resuming}
    >
      {#if resuming}
        <LoaderCircle class="size-8 animate-spin text-white" />
      {:else}
        <Pause class="size-8 text-white/60 group-hover:hidden" />
        <Play class="hidden size-8 text-white group-hover:block" />
      {/if}
      <span class="text-sm font-semibold text-white">
        {#if resuming}Resuming...{:else}<span class="group-hover:hidden">Paused</span><span
            class="hidden group-hover:inline">Resume</span
          >{/if}
      </span>
    </button>
  {/if}
  <!-- Title -->
  <h2 class="flex w-full justify-between px-4 text-center text-lg font-bold">
    <span>{shocker.name}</span>
    <ShockerMenu {shocker} />
  </h2>

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
    <LiveSlider {liveState} onRelease={() => connection.sendFrame(shocker.id, 0, liveState.type)} />
  </div>
</div>

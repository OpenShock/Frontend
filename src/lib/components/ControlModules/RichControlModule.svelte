<script lang="ts">
  import { LoaderCircle, Pause, Play, Signal, Timer } from '@lucide/svelte';
  import { shockersV1Api } from '$lib/api';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
  import type { ShockerResponse } from '$lib/api/internal/v1';
  import {
    ControlDurationDefault,
    ControlDurationProps,
    ControlIntensityDefault,
    ControlIntensityProps,
  } from '$lib/constants/ControlConstants';
  import { getConnection } from '$lib/signalr/user.svelte';
  import { ControlType } from '$lib/signalr/models/ControlType';
  import { serializeControlMessages } from '$lib/signalr/serializers/Control';
  import { useShockerEvents } from '$lib/hooks/shocker-events.svelte';
  import ActionButtons from './impl/ActionButtons.svelte';

  interface Props {
    shocker: ShockerResponse;
    disabled?: boolean;
  }

  let { shocker, disabled }: Props = $props();

  let intensity = $state(ControlIntensityDefault);
  let duration = $state(ControlDurationDefault);
  const { active } = useShockerEvents(() => shocker.id);

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

  function ctrl(type: ControlType) {
    const conn = getConnection();
    if (!conn) return;
    serializeControlMessages(conn, [{ id: shocker.id, type, intensity, duration }]);
  }
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
  <h2 class="w-full truncate px-4 text-center text-lg font-bold">{shocker.name}</h2>
  <!-- Sliders -->
  <div class="grid grid-cols-[24px_128px_40px] items-center gap-1 text-center">
    <Signal />
    <input type="range" bind:value={intensity} {...ControlIntensityProps} />
    <p>{intensity}%</p>
    <Timer />
    <input type="range" bind:value={duration} {...ControlDurationProps} />
    <p>{duration}s</p>
  </div>
  <!-- Buttons -->
  <ActionButtons {ctrl} {duration} {active} {disabled} />
</div>

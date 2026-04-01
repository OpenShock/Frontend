<script lang="ts">
  import { LoaderCircle, Pause, Play } from '@lucide/svelte';
  import { shockersV1Api } from '$lib/api';
  import type { ShockerResponse } from '$lib/api/internal/v1';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
  import { getConnection } from '$lib/signalr/user.svelte';
  import { ControlType } from '$lib/signalr/models/ControlType';
  import { serializeControlMessages } from '$lib/signalr/serializers/Control';
  import { useShockerEvents } from '$lib/hooks/shocker-events.svelte';
  import ActionButtons from './impl/ActionButtons.svelte';

  interface Props {
    shocker: ShockerResponse;
    shockIntensity: number;
    vibrationIntensity: number;
    duration: number;
    disabled?: boolean;
  }

  let { shocker, shockIntensity, vibrationIntensity, duration, disabled }: Props = $props();

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
    let intensity: number;
    switch (type) {
      case ControlType.Stop:
        intensity = 0;
        break;
      case ControlType.Shock:
        intensity = shockIntensity;
        break;
      case ControlType.Vibrate:
        intensity = vibrationIntensity;
        break;
      case ControlType.Sound:
        intensity = 0;
        break;
      default:
        return;
    }

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
  <!-- Buttons -->
  <ActionButtons {ctrl} {duration} {active} {disabled} />
</div>

<script lang="ts">
  import { Pause, Play } from '@lucide/svelte';
  import { shockersV1Api } from '$lib/api';
  import type { BooleanLegacyDataResponse } from '$lib/api/internal/v1';
  import { Button } from '$lib/components/ui/button';
  import { toast } from 'svelte-sonner';
  import LoadingCircle from '../svg/LoadingCircle.svelte';

  interface Props {
    shockerId: string;
    paused: boolean;
    userShareUserId: string | undefined;
    onPausedChange: (paused: boolean) => void;
  }

  let { shockerId, paused = $bindable(), userShareUserId, onPausedChange }: Props = $props();
  let requestInProgress = $state(false);

  function handleClick() {
    requestInProgress = true;

    let pauseRequest: Promise<BooleanLegacyDataResponse>;

    if (userShareUserId) {
      pauseRequest = shockersV1Api.shockerShockerShareCodePause(shockerId, userShareUserId, {
        pause: !paused,
      });
    } else {
      pauseRequest = shockersV1Api.shockerPauseShocker(shockerId, { pause: !paused });
    }

    pauseRequest
      .then((newPausedState) => {
        paused = newPausedState.data;
      })
      .catch((error) => {
        toast.error(`Failed to toggle pause state: ${error.message}`);
        console.error(error);
      })
      .finally(() => {
        requestInProgress = false;
        onPausedChange(paused);
      });
  }
</script>

<Button onclick={handleClick}>
  {#if requestInProgress}
    <LoadingCircle />
  {:else if paused}
    <Play />
  {:else}
    <Pause />
  {/if}
</Button>

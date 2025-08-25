<script lang="ts">
  import { Asterisk, LoaderCircle, Pause, Play } from '@lucide/svelte';
  import { shockersV1Api } from '$lib/api';
  import type { BooleanLegacyDataResponse } from '$lib/api/internal/v1';
  import { Button } from '$lib/components/ui/button';
  import { toast } from 'svelte-sonner';
  interface Props {
    shockers: PauseToggleProps[];
    onPausedChange: (paused: boolean) => void;
  }

  interface PauseToggleProps {
    shockerId: string;
    paused: boolean;
    userShareUserId: string | undefined;
  }

  let { shockers, onPausedChange }: Props = $props();
  let requestInProgress = $state(false);

  let pausedBooleans = $derived(() => {
    if (shockers.every(item => item.paused)) {
      return "allTrue";
    }
    if (shockers.every(item => !item.paused)) {
      return "allFalse";
    }
    return "mixed";
  });


  function handleClick(e: MouseEvent) {
    e.stopPropagation();
    if(requestInProgress) return;
    requestInProgress = true;

    const pause = pausedBooleans() !== "allTrue";

    let pauseRequests: Promise<void>[] = [];

    for (const shocker of shockers) {
      pauseRequests.push(SetPauseState(shocker, pause));
    }

    Promise.all(pauseRequests)
      .catch((error) => {
        toast.error(`Failed to update shocker states`);
        console.error(error);
      })
      .finally(() => {
        requestInProgress = false;
        onPausedChange(pause);
      });
  }

  async function SetPauseState(shocker: PauseToggleProps, pause: boolean) {
    let pauseRequest: Promise<BooleanLegacyDataResponse>;

    if (shocker.userShareUserId) {
      pauseRequest = shockersV1Api.shockerShockerShareCodePause(shocker.shockerId, shocker.userShareUserId, {
        pause: pause
      });
    } else {
      pauseRequest = shockersV1Api.shockerPauseShocker(shocker.shockerId, { pause: pause });
    }

    pauseRequest.then((newPausedState) => {
      shocker.paused = newPausedState.data;
    }).catch((error) => {
      toast.error(`Failed to set shocker pause state`);
      console.error(error);
    });

    await pauseRequest;
  }

</script>

<Button disabled={requestInProgress} onclick={handleClick} class="size-9" variant={pausedBooleans() === 'allTrue' ? 'destructive' : 'default'}>
  {#if requestInProgress}
    <LoaderCircle class="animate-spin" />
  {:else if pausedBooleans() === "allTrue"}
    <Play />
  {:else if pausedBooleans() === "allFalse"}
    <Pause />
  {:else if pausedBooleans() === "mixed"}
    <Asterisk />
  {/if}
</Button>

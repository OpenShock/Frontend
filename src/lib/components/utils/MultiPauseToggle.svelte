<script lang="ts">
  import { shockerPauseShocker, shockerShockerShareCodePause } from '$lib/api';
  import type { BooleanLegacyDataResponse } from '$lib/api';
  import { Asterisk, Pause, Play } from '@lucide/svelte';
  import { Button } from '@openshock/svelte-core/components/ui/button/index.js';
  import { Spinner } from '@openshock/svelte-core/components/ui/spinner/index.js';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';

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

  let pausedBooleans = $derived.by(() => {
    if (shockers.every((item) => item.paused)) {
      return 'allTrue';
    }
    if (shockers.every((item) => !item.paused)) {
      return 'allFalse';
    }
    return 'mixed';
  });

  function handleClick(e: MouseEvent) {
    e.stopPropagation();
    if (requestInProgress) return;
    requestInProgress = true;

    const pause = pausedBooleans !== 'allTrue';

    let pauseRequests: Promise<void>[] = [];

    for (const shocker of shockers) {
      pauseRequests.push(SetPauseState(shocker, pause));
    }

    Promise.all(pauseRequests)
      .catch(handleApiError)
      .finally(() => {
        requestInProgress = false;
        onPausedChange(pause);
      });
  }

  async function SetPauseState(shocker: PauseToggleProps, pause: boolean) {
    let pauseRequest: Promise<BooleanLegacyDataResponse>;

    if (shocker.userShareUserId) {
      pauseRequest = shockerShockerShareCodePause({
        path: { shockerId: shocker.shockerId, sharedWithUserId: shocker.userShareUserId },
        body: { pause },
      });
    } else {
      pauseRequest = shockerPauseShocker({
        path: { shockerId: shocker.shockerId },
        body: { pause },
      });
    }

    const newPausedState = await pauseRequest;
    shocker.paused = newPausedState.data;
  }
</script>

<Button
  disabled={requestInProgress}
  onclick={handleClick}
  class="size-9"
  variant={pausedBooleans === 'allTrue' ? 'destructive' : 'default'}
  title={pausedBooleans === 'allTrue' ? 'Resume all shockers' : 'Pause all shockers'}
  aria-busy={requestInProgress}
>
  {#if requestInProgress}
    <Spinner />
  {:else if pausedBooleans === 'allTrue'}
    <Play />
  {:else if pausedBooleans === 'allFalse'}
    <Pause />
  {:else if pausedBooleans === 'mixed'}
    <Asterisk />
  {/if}
</Button>

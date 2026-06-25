<script lang="ts">
  import { shockerPauseShocker, shockerShockerShareCodePause } from '$lib/api';
  import type { BooleanLegacyDataResponse } from '$lib/api';
  import { Pause, Play } from '@lucide/svelte';
  import { Button } from '$hadcn/button';
  import { Spinner } from '$hadcn/spinner';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';

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
      pauseRequest = shockerShockerShareCodePause({
        path: { shockerId, sharedWithUserId: userShareUserId },
        body: { pause: !paused },
      });
    } else {
      pauseRequest = shockerPauseShocker({
        path: { shockerId },
        body: { pause: !paused },
      });
    }

    pauseRequest
      .then((newPausedState) => {
        paused = newPausedState.data;
      })
      .catch(handleApiError)
      .finally(() => {
        requestInProgress = false;
        onPausedChange(paused);
      });
  }
</script>

<Button
  onclick={handleClick}
  disabled={requestInProgress}
  class="size-9"
  variant={paused ? 'destructive' : 'default'}
  title={paused ? 'Resume shocker' : 'Pause shocker'}
  aria-busy={requestInProgress}
>
  {#if requestInProgress}
    <Spinner />
  {:else if paused}
    <Play />
  {:else}
    <Pause />
  {/if}
</Button>

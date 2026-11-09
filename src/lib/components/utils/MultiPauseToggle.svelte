<script lang="ts">
  import { m } from '#lib/paraglide/messages.js';
  import { shockerPauseShocker, shockerShockerShareCodePause } from '#lib/api/index.js';
  import type { LegacyDataResponseOfboolean } from '#lib/api/index.js';
  import { Asterisk, Pause, Play } from '@lucide/svelte';
  import { Button } from '@openshock/svelte-core/components/ui/button';
  import { Spinner } from '@openshock/svelte-core/components/ui/spinner';
  import { handleApiError } from '#lib/errorhandling/apiErrorHandling.js';

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
    let pauseRequest: Promise<LegacyDataResponseOfboolean>;

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
  title={pausedBooleans === 'allTrue' ? m.pause_resume_all() : m.pause_pause_all()}
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

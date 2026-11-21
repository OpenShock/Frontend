<script lang="ts">
  import { m } from '#lib/paraglide/messages.js';
  import { shockerPauseShocker } from '#lib/api/index.js';
  import type { ShockerResponse } from '#lib/api/index.js';
  import { Pause, Play } from '@lucide/svelte';
  import { Button } from '@openshock/svelte-core/components/ui/button';
  import { Spinner } from '@openshock/svelte-core/components/ui/spinner';
  import { handleApiError } from '#lib/errorhandling/apiErrorHandling.js';
  import { toast } from 'svelte-sonner';

  interface Props {
    shocker: ShockerResponse;
  }

  let { shocker }: Props = $props();

  let pauseLoading = $state(false);

  async function togglePause() {
    pauseLoading = true;
    try {
      const result = await shockerPauseShocker({
        path: { shockerId: shocker.id },
        body: { pause: !shocker.isPaused },
      });
      shocker.isPaused = result.data ?? shocker.isPaused;
      toast.success(shocker.isPaused ? m.shocker_toast_paused() : m.shocker_toast_resumed());
    } catch (error) {
      handleApiError(error);
    } finally {
      pauseLoading = false;
    }
  }
</script>

<Button
  variant="ghost"
  size="icon"
  class="relative size-8 p-0"
  onclick={togglePause}
  disabled={pauseLoading}
  title={shocker.isPaused ? m.pause_resume_shocker() : m.pause_pause_shocker()}
  aria-busy={pauseLoading}
>
  <span class="sr-only"
    >{shocker.isPaused ? m.pause_resume_shocker() : m.pause_pause_shocker()}</span
  >
  {#if pauseLoading}
    <Spinner class="size-4" />
  {:else if shocker.isPaused}
    <Play class="size-4" />
  {:else}
    <Pause class="size-4" />
  {/if}
</Button>

<script lang="ts">
  import { shockerPauseShocker } from '$lib/api';
  import type { ShockerResponse } from '$lib/api';
  import { Pause, Play } from '@lucide/svelte';
  import { Button } from '$hadcn/button';
  import { Spinner } from '$hadcn/spinner';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
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
      toast.success(shocker.isPaused ? 'Shocker paused' : 'Shocker resumed');
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
  title={shocker.isPaused ? 'Resume shocker' : 'Pause shocker'}
  aria-busy={pauseLoading}
>
  <span class="sr-only">{shocker.isPaused ? 'Resume shocker' : 'Pause shocker'}</span>
  {#if pauseLoading}
    <Spinner class="size-4" />
  {:else if shocker.isPaused}
    <Play class="size-4" />
  {:else}
    <Pause class="size-4" />
  {/if}
</Button>

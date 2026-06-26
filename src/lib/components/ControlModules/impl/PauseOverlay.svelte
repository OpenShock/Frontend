<script lang="ts">
  import { Pause, Play } from '@lucide/svelte';
  import { Spinner } from '@openshock/svelte-core/ui/spinner';
  import { cn } from '@openshock/svelte-core/utils/shadcn';

  interface Props {
    isPaused: boolean;
    pauseReason?: string | null;
    resume?: () => Promise<void>;
  }

  let { isPaused, pauseReason, resume }: Props = $props();

  let resuming = $state(false);

  async function handleResume() {
    if (!resume) return;
    resuming = true;
    try {
      await resume();
    } finally {
      resuming = false;
    }
  }
</script>

<div
  class={cn(
    'absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 rounded-md bg-black/60 opacity-0 backdrop-blur-sm transition-opacity duration-300 ease-out',
    isPaused ? 'pointer-events-auto opacity-100' : 'pointer-events-none'
  )}
  aria-hidden={!isPaused}
>
  {#if resume}
    <button
      class="group absolute inset-0 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md transition-colors hover:bg-black/10"
      onclick={handleResume}
      disabled={!isPaused || resuming}
      tabindex={isPaused ? 0 : -1}
    >
      {#if resuming}
        <Spinner class="size-8 text-white" />
      {:else}
        <Pause class="size-8 text-white/60 group-hover:hidden" />
        <Play class="hidden size-8 text-white group-hover:block" />
      {/if}
      <span class="text-sm font-semibold text-white">
        {#if resuming}
          Resuming...
        {:else}
          <span class="group-hover:hidden">Paused</span>
          <span class="hidden group-hover:inline">Resume</span>
        {/if}
      </span>
    </button>
  {:else}
    <Pause class="size-8 text-white/60" />
    <span class="text-sm font-semibold text-white">
      {#if pauseReason}
        Paused at {pauseReason} level
      {:else}
        Paused
      {/if}
    </span>
  {/if}
</div>

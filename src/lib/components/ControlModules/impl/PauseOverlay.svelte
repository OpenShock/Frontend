<script lang="ts">
  import { LoaderCircle, Pause, Play } from '@lucide/svelte';

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

{#if isPaused}
  {#if resume}
    <button
      class="group absolute inset-0 z-10 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md bg-black/60 backdrop-blur-sm transition-colors hover:bg-black/50"
      onclick={handleResume}
      disabled={resuming}
    >
      {#if resuming}
        <LoaderCircle class="size-8 animate-spin text-white" />
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
    <div
      class="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 rounded-md bg-black/60 backdrop-blur-sm"
    >
      <Pause class="size-8 text-white/60" />
      <span class="text-sm font-semibold text-white">
        {#if pauseReason}
          Paused at {pauseReason} level
        {:else}
          Paused
        {/if}
      </span>
    </div>
  {/if}
{/if}

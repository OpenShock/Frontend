<script lang="ts">
  import type { Snippet } from 'svelte';
  import { cn } from '$core/utils/shadcn';
  import PauseOverlay from './impl/PauseOverlay.svelte';

  interface Props {
    name: string;
    hubName?: string;
    hubOnline?: boolean;
    showHubBadge?: boolean;
    isPaused: boolean;
    pauseReason?: string | null;
    resume?: () => Promise<void>;
    live?: Snippet;
    pause?: Snippet;
    menu?: Snippet;
    children: Snippet;
    class?: string;
  }

  let {
    name,
    hubName,
    hubOnline = false,
    showHubBadge = false,
    isPaused,
    pauseReason,
    resume,
    live,
    pause,
    menu,
    children,
    class: className,
  }: Props = $props();
</script>

<div
  class={cn(
    'border-surface-400-500-token bg-card flex w-80 flex-col overflow-hidden rounded-md border',
    className
  )}
>
  <!-- Header -->
  <div class="border-border/60 flex items-center gap-2 border-b px-3 py-2">
    <div class="flex min-w-0 flex-1 flex-col">
      <h2 class="truncate text-sm leading-tight font-semibold" title={name}>{name}</h2>
      {#if showHubBadge && hubName}
        <div class="text-muted-foreground flex items-center gap-1.5 text-[11px]">
          <span
            class="size-1.5 shrink-0 rounded-full {hubOnline ? 'bg-green-400' : 'bg-red-500'}"
            title={hubOnline ? 'Online' : 'Offline'}
          ></span>
          <span class="truncate" title={hubName}>{hubName}</span>
        </div>
      {/if}
    </div>
    {#if live}
      <div class="shrink-0">{@render live()}</div>
    {/if}
    {#if pause}
      <div class="shrink-0">{@render pause()}</div>
    {/if}
    {#if menu}
      <div class="shrink-0">{@render menu()}</div>
    {/if}
  </div>

  <!-- Body -->
  <div class="relative flex flex-col items-center gap-2 p-2">
    <PauseOverlay {isPaused} {pauseReason} {resume} />
    {@render children()}
  </div>
</div>

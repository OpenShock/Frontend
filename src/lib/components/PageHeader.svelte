<script lang="ts">
  import { cn } from '$lib/utils';
  import type { Snippet } from 'svelte';

  let {
    title,
    subtitle,
    children,
    class: className,
  }: {
    title: string;
    subtitle?: string;
    children?: Snippet;
    class?: string;
  } = $props();
</script>

<div class={cn('mb-4 w-full', className)}>
  <div class="flex w-full flex-wrap items-center gap-x-2 gap-y-1">
    <h1 class="text-3xl font-bold">
      {title}
    </h1>
    {#if children}
      <div class="ml-auto flex flex-wrap items-center justify-end gap-1">
        {@render children()}
      </div>
    {/if}
  </div>

  {#if subtitle}
    <p class="text-muted-foreground mt-1">{subtitle}</p>
  {/if}
</div>

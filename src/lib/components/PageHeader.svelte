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
  <div class="flex w-full flex-col gap-2 sm:flex-row sm:items-center">
    <h1 class="hidden text-3xl font-bold sm:block">
      {title}
    </h1>
    {#if children}
      <div class="flex flex-wrap items-center gap-1 sm:ml-auto sm:justify-end">
        {@render children()}
      </div>
    {/if}
  </div>

  {#if subtitle}
    <p class="text-muted-foreground mt-1">{subtitle}</p>
  {/if}
</div>

<script lang="ts">
  import * as Empty from '$lib/components/ui/empty';
  import { cn } from '$lib/utils';
  import type { Component, Snippet } from 'svelte';

  interface Props {
    /** Icon component (e.g. a lucide icon) rendered in the media slot. */
    icon: Component;
    title: string;
    description?: string;
    /** `default` fills/centers the available space; `compact` is a small bordered box. */
    compact?: boolean;
    class?: string;
    /** Optional action area (e.g. a button), rendered below the text. */
    children?: Snippet;
  }

  let { icon: Icon, title, description, compact, class: className, children }: Props = $props();
</script>

<Empty.Root class={cn(compact ? 'flex-none rounded-md border' : 'gap-6 py-12 sm:gap-8', className)}>
  <Empty.Header class={compact ? undefined : 'gap-3'}>
    <Empty.Media
      variant="icon"
      class={compact
        ? undefined
        : "size-16 rounded-2xl sm:size-20 [&_svg:not([class*='size-'])]:size-8 sm:[&_svg:not([class*='size-'])]:size-10"}
    >
      <Icon />
    </Empty.Media>
    <Empty.Title class={compact ? undefined : 'text-xl sm:text-2xl'}>{title}</Empty.Title>
    {#if description}
      <Empty.Description class={compact ? undefined : 'text-base sm:text-lg'}>
        {description}
      </Empty.Description>
    {/if}
  </Empty.Header>
  {#if children}
    <Empty.Content>
      {@render children()}
    </Empty.Content>
  {/if}
</Empty.Root>

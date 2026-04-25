<script lang="ts">
  import type { ChildrenFunc } from '$lib/types/ChildrenFunc';
  import { cn } from '$lib/utils';

  interface Props {
    children: ChildrenFunc;
    class?: string;
  }

  let { children, class: className }: Props = $props();
</script>

<div
  class={cn(
    'container mx-auto flex h-full flex-col items-start justify-start gap-4 p-4 sm:p-12',
    className
  )}
>
  {@render children()}
</div>

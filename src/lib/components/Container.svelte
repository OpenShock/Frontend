<script lang="ts">
  import { cn } from '$lib/utils';

  interface Props {
    children: () => any;
    class?: string;
  }

  let { children, class: classname }: Props = $props();
</script>

<div
  class={cn(
    'container mx-auto flex h-full flex-col items-start justify-start gap-4 p-0 sm:p-12',
    classname
  )}
>
  {@render children()}
</div>

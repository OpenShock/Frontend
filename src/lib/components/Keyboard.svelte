<script lang="ts">
  interface Props {
    children?: () => any;
  }

  let { children }: Props = $props();
</script>

<kbd
  class="inline-flex min-h-[30px] items-center justify-center rounded-md border border-gray-200 bg-white px-1.5 py-1 font-mono text-sm text-gray-800 shadow-[0px_2px_0px_0px_rgba(0,0,0,0.08)] dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:shadow-[0px_2px_0px_0px_rgba(255,255,255,0.1)]"
>
  {@render children?.()}
</kbd>

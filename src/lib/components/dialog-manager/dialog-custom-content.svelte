<script lang="ts" generics="T, R">
  import type { CustomProps, DialogRenderProps } from './types.ts';

  let { data: initialData, contentSnippet, resolve, close }: CustomProps<T, R> = $props();

  // svelte-ignore state_referenced_locally -- intentionally captures initial value as own reactive copy
  let data: T = $state(initialData as T);

  const renderProps: DialogRenderProps<T, R> = $derived({
    data,
    resolve,
    close,
  });
</script>

{@render contentSnippet(renderProps)}

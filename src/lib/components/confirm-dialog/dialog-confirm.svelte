<script lang="ts" generics="T">
  import Button from '$lib/components/ui/button/button.svelte';
  import * as Dialog from '$lib/components/ui/dialog';
  import type { Snippet } from 'svelte';

  interface Props {
    open: boolean;
    data: T;
    onConfirm: (value: T) => void;
    title: string;
    desc?: string;
    confirmButtonText: string;
    descSnippet?: Snippet<[T]>;
  }

  let { open = $bindable(), data, onConfirm, title, desc, confirmButtonText, descSnippet }: Props = $props();

</script>

<Dialog.Root bind:open={() => open, (o) => (open = o)}>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>{title}</Dialog.Title>
      <Dialog.Description>
        {desc}
        {#if descSnippet}
          {@render descSnippet(data)}
        {/if}
      </Dialog.Description>
    </Dialog.Header>
    <Button variant="destructive" onclick={() => onConfirm(data)}>{confirmButtonText}</Button>
  </Dialog.Content>
</Dialog.Root>
<script lang="ts" generics="T">
  import { LoaderCircle } from '@lucide/svelte';
  import Button from '$lib/components/ui/button/button.svelte';
  import * as Dialog from '$lib/components/ui/dialog';
  import type { Snippet } from 'svelte';

  interface Props {
    open: boolean;
    data: T;
    onConfirm: (value: T) => Promise<void> | void;
    title: string;
    desc?: string;
    confirmButtonText?: string;
    descSnippet?: Snippet<[T]>;
  }

  let {
    open = $bindable(),
    data,
    onConfirm,
    title,
    desc,
    confirmButtonText,
    descSnippet,
  }: Props = $props();
  let promiseRunning = $state(false);

  function click() {
    promiseRunning = true;

    Promise.resolve(onConfirm(data)).finally(() => {
      open = false;
      promiseRunning = false;
    });
  }
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
    <Button disabled={promiseRunning} variant="destructive" onclick={click}
      >{#if promiseRunning}<LoaderCircle class="animate-spin" />{/if}{confirmButtonText
        ? confirmButtonText
        : 'Confirm'}</Button
    >
  </Dialog.Content>
</Dialog.Root>

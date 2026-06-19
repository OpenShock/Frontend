<script lang="ts" generics="T">
  import { Spinner } from '$lib/components/ui/spinner';
  import { Button } from '$lib/components/ui/button';
  import * as Dialog from '$lib/components/ui/dialog';
  import type { ConfirmProps } from './types.ts';

  let {
    title,
    desc,
    data,
    confirmButtonText = 'Confirm',
    cancelButtonText = 'Cancel',
    descSnippet,
    resolve,
    close,
  }: ConfirmProps<T> = $props();

  let loading = $state(false);

  function handleConfirm() {
    loading = true;
    resolve({ confirmed: true, data: data as T });
  }

  function handleCancel() {
    close();
  }
</script>

<Dialog.Header>
  <Dialog.Title>{title}</Dialog.Title>
  <Dialog.Description>
    {desc}
    {#if descSnippet}
      {@render descSnippet(data as T)}
    {/if}
  </Dialog.Description>
</Dialog.Header>
<Dialog.Footer>
  <Button variant="outline" onclick={handleCancel}>{cancelButtonText}</Button>
  <Button disabled={loading} variant="destructive" onclick={handleConfirm}>
    {#if loading}<Spinner />{/if}
    {confirmButtonText}
  </Button>
</Dialog.Footer>

<script lang="ts">
  import * as Dialog from '$lib/components/ui/dialog';
  import { getOldestDialog } from './dialog-store.svelte.ts';

  let entry = $derived(getOldestDialog());
  let dialogId = $derived(entry?.[0]);
  let ctx = $derived(entry?.[1]);

  let open = $state(true);

  // Reset open when dialog changes
  $effect(() => {
    if (dialogId) {
      open = true;
    }
  });

  function handleOpenChange(isOpen: boolean) {
    if (!isOpen && ctx) {
      // Dialog was closed (escape, overlay click, etc.) - call close handler
      (ctx.props as { close?: () => void }).close?.();
    }
    open = isOpen;
  }
</script>

{#if dialogId && ctx}
  {#key dialogId}
    <Dialog.Root bind:open={() => open, handleOpenChange}>
      <Dialog.Content>
        <ctx.content {...ctx.props} />
      </Dialog.Content>
    </Dialog.Root>
  {/key}
{/if}

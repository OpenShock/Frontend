<script lang="ts">
  import { type ConfirmDialogContext, ConfirmDialogStore } from '$lib/stores/ConfirmDialogStore';
  import { onMount } from 'svelte';
  import DialogConfirm from './dialog-confirm.svelte';

  let dialogData: ConfirmDialogContext<any> | null = $state(null);
  let dialogCounter = $state(0);
  let dialogOpen = $state(false);

  onMount(() => {
    const sub = ConfirmDialogStore.subscribe((value) => {
      dialogData = value;
      dialogCounter += 1;
      dialogOpen = true;
    });
    return () => sub();
  });
</script>

{#key dialogCounter}
  {#if dialogData}
    <DialogConfirm {...dialogData} bind:open={dialogOpen} />
  {/if}
{/key}

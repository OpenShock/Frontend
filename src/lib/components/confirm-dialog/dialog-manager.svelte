<script lang="ts">
  import { ConfirmDialogStore, type ConfirmDialogContext } from '$lib/stores/ConfirmDialogStore';
  import { onMount } from 'svelte';
  import DialogConfirm from './dialog-confirm.svelte';

  let dialogData: ConfirmDialogContext<any> | null = $state(null);
  let dialogCounter = $state(0);
  let dialogOpen = $state(false);

  onMount(()=> {
    ConfirmDialogStore.subscribe((value) => {
      dialogData = value;
      dialogCounter += 1;
      dialogOpen = true;
    })
  });

</script>

{#key dialogCounter}
    {#if dialogData}
        <DialogConfirm {...dialogData} bind:open={dialogOpen} />
    {/if}
{/key}
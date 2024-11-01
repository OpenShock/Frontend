<script lang="ts">
  import { ModalStore } from '$lib/stores/ModalStore';

  let active = $derived($ModalStore.length > 0 ? $ModalStore[$ModalStore.length - 1] : null);
</script>

{#if active !== null}
  <div>
    {#if active.type === 'component'}
      <svelte:component this={active.modal} arg={active.arg} />
    {:else if active.type === 'snippet'}
      {@render active.modal(active.arg)}
    {/if}
  </div>
{/if}

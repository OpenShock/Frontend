<script lang="ts">
  export let title: string;
  export let description: string | undefined = undefined;
</script>

<svelte:head>
  <title>{title}</title>
  {#if description}
    <meta name="description" content={description} />
  {/if}
</svelte:head>

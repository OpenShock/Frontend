<script lang="ts">
  import { isTwitterHandle } from '$lib/typeGuards';

  export let site: string | number | undefined = undefined;
  export let description: string | undefined = undefined;
  export let title: string | undefined = undefined;
  export let image: { src: string; alt: string } | undefined = undefined;
  export let player:
    | { type: 'iframe' | 'stream'; src: string; width: number; height: number }
    | undefined = undefined;
</script>

<svelte:head>
  <meta name="twitter:card" content="player" />
  {#if site}
    {#if isTwitterHandle(site)}
      <meta name="twitter:site" content={site} />
    {:else}
      <meta name="twitter:site:id" content={site.toString()} />
    {/if}
  {/if}
  {#if description}
    <meta name="twitter:description" content={description} />
  {/if}
  {#if title}
    <meta name="twitter:title" content={title} />
  {/if}
  {#if image}
    <meta name="twitter:image" content={image.src} />
    <meta name="twitter:image:alt" content={image.alt} />
  {/if}
  {#if player}
    {#if player.type === 'iframe'}
      <meta name="twitter:player" content={player.src} />
    {/if}
    <meta name="twitter:player:width" content={player.width.toString()} />
    <meta name="twitter:player:height" content={player.height.toString()} />
    {#if player.type === 'stream'}
      <meta name="twitter:player" content={player.src} />
    {/if}
  {/if}
</svelte:head>

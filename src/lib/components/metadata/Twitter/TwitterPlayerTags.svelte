<script lang="ts">
  import { isTwitterHandle } from '$lib/typeguards';

  interface Props {
    site?: string | number;
    description?: string;
    title?: string;
    image?: { src: string; alt: string };
    player?: { type: 'iframe' | 'stream'; src: string; width: number; height: number };
  }

  let {
    site,
    description,
    title,
    image,
    player
  }: Props = $props();
</script>

<svelte:head>
  <meta name="twitter:card" content="player" />
  {#if site}
    {#if isTwitterHandle(site)}
      <meta name="twitter:site" content={site.toString()} />
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

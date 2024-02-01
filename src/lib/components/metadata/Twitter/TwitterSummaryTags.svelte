<script lang="ts">
  import { isTwitterHandle } from '$lib/typeguards/twitterHandleGuard';

  export let type: 'summary' | 'summary_large_image';
  export let title: string | undefined = undefined;
  export let description: string | undefined = undefined;
  export let image: { src: string; alt: string } | undefined = undefined;
  export let site: string | number | undefined = undefined;
  export let creator: string | number | undefined = undefined;
</script>

<svelte:head>
  <meta name="twitter:card" content={type} />
  {#if site}
    {#if isTwitterHandle(site)}
      <meta name="twitter:site" content={site} />
    {:else}
      <meta name="twitter:site:id" content={site.toString()} />
    {/if}
  {/if}
  {#if creator}
    {#if isTwitterHandle(creator)}
      <meta name="twitter:creator" content={creator} />
    {:else}
      <meta name="twitter:creator:id" content={creator.toString()} />
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
</svelte:head>

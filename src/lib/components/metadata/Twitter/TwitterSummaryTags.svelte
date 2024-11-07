<script lang="ts">
  import { isTwitterHandle } from '$lib/typeguards/twitterHandleGuard';

  interface Props {
    type: 'summary' | 'summary_large_image';
    title?: string;
    description?: string;
    image?: { src: string; alt: string };
    site?: string | number;
    creator?: string | number;
  }

  let { type, title, description, image, site, creator }: Props = $props();
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

<script lang="ts">
  export let type:
    | 'website'
    | 'profile'
    | 'article'
    | 'book'
    | 'video.movie'
    | 'video.episode'
    | 'video.tv_show'
    | 'video.other'
    | 'music.song'
    | 'music.album'
    | 'music.playlist'
    | 'music.radio_station';
  export let title: string;
  export let image: {
    src: string;
    type?: string;
    width?: number;
    height?: number;
    alt?: string;
  };
  export let url: string;
  export let siteName: string | undefined = undefined;
  export let description: string | undefined = undefined;
  export let determiner: string | undefined = undefined;
  export let metaLocale: string | undefined = undefined;
  export let locales: string[] | undefined = undefined;
  export let video: { src: string; type?: string; width?: number; height?: number } | undefined =
    undefined;
  export let audio: { src: string; type?: string } | undefined = undefined;
</script>

<svelte:head>
  <meta property="og:type" content={type} />
  <meta property="og:title" content={title} />

  <meta property="og:image" content={image.src} />
  {#if image.type}
    <meta property="og:image:type" content={image.type} />
  {/if}
  {#if image.width}
    <meta property="og:image:width" content={image.width.toString()} />
  {/if}
  {#if image.height}
    <meta property="og:image:height" content={image.height.toString()} />
  {/if}
  {#if image.alt}
    <meta property="og:image:alt" content={image.alt} />
  {/if}

  <meta property="og:url" content={url} />
  {#if siteName}
    <meta property="og:site_name" content={siteName} />
  {/if}
  {#if description}
    <meta property="og:description" content={description} />
  {/if}
  {#if determiner}
    <meta property="og:determiner" content={determiner} />
  {/if}

  {#if metaLocale}
    <meta property="og:locale" content={metaLocale} />
  {/if}
  {#if locales}
    {#each locales as locale}
      <meta property="og:locale:alternate" content={locale} />
    {/each}
  {/if}

  {#if video}
    <meta property="og:video" content={video.src} />
    {#if video.type}
      <meta property="og:video:type" content={video.type} />
    {/if}
    {#if video.width}
      <meta property="og:video:width" content={video.width.toString()} />
    {/if}
    {#if video.height}
      <meta property="og:video:height" content={video.height.toString()} />
    {/if}
  {/if}

  {#if audio}
    <meta property="og:audio" content={audio.src} />
    {#if audio.type}
      <meta property="og:audio:type" content={audio.type} />
    {/if}
  {/if}
</svelte:head>

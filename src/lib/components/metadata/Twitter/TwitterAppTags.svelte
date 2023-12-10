<script lang="ts">
  export let site: string | undefined = undefined;
  export let iphone: { id: string; name: string; url: string } | undefined = undefined;
  export let ipad: { id: string; name: string; url: string } | undefined = undefined;
  export let googleplay: { id: string; name: string; url: string } | undefined = undefined;
</script>

<svelte:head>
  <meta name="twitter:card" content="app" />
  {#if site}
    <meta name="twitter:site" content={site} />
  {/if}
  {#if iphone}
    <meta name="twitter:app:id:iphone" content={iphone.id} />
    <meta name="twitter:app:name:iphone" content={iphone.name} />
    <meta name="twitter:app:url:iphone" content={iphone.url} />
  {/if}
  {#if ipad}
    <meta name="twitter:app:id:ipad" content={ipad.id} />
    <meta name="twitter:app:name:ipad" content={ipad.name} />
    <meta name="twitter:app:url:ipad" content={ipad.url} />
  {/if}
  {#if googleplay}
    <meta name="twitter:app:id:googleplay" content={googleplay.id} />
    <meta name="twitter:app:name:googleplay" content={googleplay.name} />
    <meta name="twitter:app:url:googleplay" content={googleplay.url} />
  {/if}
</svelte:head>

<script lang="ts">
  import { modeCurrent, ProgressRadial } from '@skeletonlabs/skeleton';
  import { browser, dev } from '$app/environment';
  import CloudflareLogo from '$lib/components/svg/CloudflareLogo.svelte';
  import { env } from '$env/dynamic/public';
  import type { TurnstileInstance } from '$lib/types/TurnstileInstance';
  import { onMount } from 'svelte';

  export let action: string;
  export let cData: string | undefined = undefined;
  export let response: string | null = null;

  let turnstile: TurnstileInstance | undefined;
  let element: HTMLDivElement;

  function handleExpired() {
    response = null;
    // Reset the widget after 5 seconds to prevent the user from spamming the button
    setTimeout(() => turnstile?.reset(element), 5000);
  }
  function handleTimeout() {
    response = null;
    // Reset the widget after 5 seconds to prevent the user from spamming the button
    setTimeout(() => turnstile?.reset(element), 5000);
  }
  function handleError() {
    response = null;
    // Reset the widget after 5 seconds to prevent the user from spamming the button
    setTimeout(() => turnstile?.reset(element), 5000);
  }

  if (browser) {
    if (dev) {
      console.log('Turnstile is disabled in dev mode');
      response = 'dev-bypass';
    } else {
      // If turstile doesnt load, then the index.html is proabably missing the script tag (https://developers.cloudflare.com/turnstile/get-started/client-side-rendering/#explicitly-render-the-turnstile-widget)
      onMount(() => (turnstile = window.turnstile));
    }
  }

  let isLoading = true;
  $: if (turnstile && isLoading) {
    turnstile.ready(() => (isLoading = false));
  }
  $: if (turnstile && !isLoading) {
    turnstile.render(element, {
      sitekey: env.PUBLIC_TURNSTILE_SITE_KEY,
      action,
      cData,
      theme: $modeCurrent ? 'light' : 'dark',
      callback: (token) => (response = token),
      'expired-callback': handleExpired,
      'timeout-callback': handleTimeout,
      'error-callback': handleError,
    });
  }
</script>

<!-- see: https://developers.cloudflare.com/turnstile/get-started/client-side-rendering/#widget-size -->
<div id="main" bind:this={element}>
  {#if isLoading}
    <!-- Turnstile placeholder -->
    <div id="placeholder">
      {#if dev}
        <i class="fa fa-bug text-lg" />
        <span> Turnstile disabled </span>
      {:else}
        <ProgressRadial stroke={120} width="w-8" />
        <span> Loading... </span>
      {/if}
      <a
        id="logo"
        href="https://www.cloudflare.com/products/turnstile/?utm_source=turnstile&utm_campaign=widget"
        rel="noopen noreferrer"
      >
        <CloudflareLogo class="mb-[1px] h-[26px]" />
      </a>
    </div>
  {/if}
</div>

<style lang="postcss">
  #main {
    @apply mx-auto h-[65px] w-[300px];
  }
  #placeholder {
    @apply flex h-full select-none items-center justify-center gap-3 p-3;
    @apply bg-[#fafafa] dark:bg-[#222];
    @apply border border-[#e0e0e0] dark:border-[#666];
  }
  #logo {
    @apply mb-auto ml-auto h-7 w-auto;
    @apply text-[#666] dark:text-[#999];
  }
</style>

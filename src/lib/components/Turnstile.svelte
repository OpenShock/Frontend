<script lang="ts">
  import Bug from 'lucide-svelte/icons/bug';
  import { browser, dev } from '$app/environment';
  import CloudflareLogo from '$lib/components/svg/CloudflareLogo.svelte';
  import type { TurnstileInstance } from '$lib/types/TurnstileInstance';
  import { onMount } from 'svelte';
  import { PUBLIC_TURNSTILE_DEV_BYPASS_VALUE, PUBLIC_TURNSTILE_SITE_KEY } from '$env/static/public';
  import { ColorSchemeStore } from '$lib/stores/ColorSchemeStore';
  import LoadingCircle from './svg/LoadingCircle.svelte';

  interface Props {
    action: string;
    cData?: string;
    response?: string | null;
  }

  let { action, cData, response = $bindable(null) }: Props = $props();

  let turnstile: TurnstileInstance | undefined = $state();
  let element: HTMLDivElement | undefined = $state();

  function resetTurnstile() {
    if (!turnstile || !element) return;
    turnstile?.reset(element);
  }
  function handleExpired() {
    response = null;
    // Reset the widget after 5 seconds to prevent the user from spamming the button
    setTimeout(resetTurnstile, 5000);
  }
  function handleTimeout() {
    response = null;
    // Reset the widget after 5 seconds to prevent the user from spamming the button
    setTimeout(resetTurnstile, 5000);
  }
  function handleError() {
    response = null;
    // Reset the widget after 5 seconds to prevent the user from spamming the button
    setTimeout(resetTurnstile, 5000);
  }

  if (browser) {
    if (dev) {
      console.log('Turnstile is disabled in dev mode');
      response = PUBLIC_TURNSTILE_DEV_BYPASS_VALUE;
    } else {
      // If turstile doesnt load, then the index.html is proabably missing the script tag (https://developers.cloudflare.com/turnstile/get-started/client-side-rendering/#explicitly-render-the-turnstile-widget)
      onMount(() => (turnstile = window.turnstile));
    }
  }

  let isLoading = $state(true);
  let cfColorScheme = $derived($ColorSchemeStore === 'system' ? 'auto' : $ColorSchemeStore) as
    | 'dark'
    | 'light'
    | 'auto';
  $effect(() => {
    if (!turnstile) return;

    if (isLoading) {
      turnstile.ready(() => (isLoading = false));
    } else if (element) {
      turnstile.render(element, {
        sitekey: PUBLIC_TURNSTILE_SITE_KEY,
        action,
        cData,
        theme: cfColorScheme,
        callback: (token) => (response = token),
        'expired-callback': handleExpired,
        'timeout-callback': handleTimeout,
        'error-callback': handleError,
      });
    }
  });
</script>

<!-- see: https://developers.cloudflare.com/turnstile/get-started/client-side-rendering/#widget-size -->
<div id="main" bind:this={element}>
  {#if isLoading}
    <!-- Turnstile placeholder -->
    <div id="placeholder">
      {#if dev}
        <Bug />
        <span> Turnstile disabled </span>
      {:else}
        <LoadingCircle />
        <span> Loading... </span>
      {/if}
      <a
        id="logo"
        href="https://www.cloudflare.com/products/turnstile/?utm_source=turnstile&utm_campaign=widget"
        target="_blank"
        rel="noreferrer"
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
    @apply bg-[#fafafa];
    @apply border border-[#e0e0e0];
  }
  :global(.dark) #placeholder {
    @apply bg-[#222];
    @apply border-[#666];
  }
  #logo {
    @apply mb-auto ml-auto h-7 w-auto;
    @apply text-[#666];
  }
  :global(.dark) #logo {
    @apply text-[#999];
  }
</style>

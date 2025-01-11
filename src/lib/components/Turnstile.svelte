<script lang="ts">
  import { dev } from '$app/environment';
  import { PUBLIC_TURNSTILE_DEV_BYPASS_VALUE, PUBLIC_TURNSTILE_SITE_KEY } from '$env/static/public';
  import CloudflareLogo from '$lib/components/svg/CloudflareLogo.svelte';
  import { ColorSchemeStore } from '$lib/stores/ColorSchemeStore';
  import type { TurnstileInstance } from '$lib/types/TurnstileInstance';
  import { onMount } from 'svelte';
  import { toast } from 'svelte-sonner';
  import LoadingCircle from './svg/LoadingCircle.svelte';

  import Bug from 'lucide-svelte/icons/bug';

  interface Props {
    action: string;
    cData?: string;
    response?: string | null;
  }

  let { action, cData, response = $bindable(null) }: Props = $props();

  let turnstile = $state<TurnstileInstance | undefined>();
  let element = $state<HTMLDivElement | undefined>();
  let widgetId = $state<string | undefined>();
  let widgetState = $state<'unmounted' | 'mounting' | 'mounted'>('unmounted');

  function resetWidget() {
    if (turnstile && widgetId) turnstile.reset(widgetId);
  }
  function removeWidget() {
    if (turnstile && widgetId) turnstile.remove(widgetId);
    widgetId = undefined;
  }
  function handleExpired() {
    response = null;
    // Reset the widget after 5 seconds to prevent the user from spamming the button
    setTimeout(resetWidget, 5000);
  }
  function handleTimeout() {
    response = null;
    // Reset the widget after 5 seconds to prevent the user from spamming the button
    setTimeout(resetWidget, 5000);
  }
  function handleError() {
    toast.warning('Turnstile encountered an error');

    response = null;
    // Reset the widget after 5 seconds to prevent the user from spamming the button
    setTimeout(resetWidget, 5000);
  }

  let cfColorScheme = $derived($ColorSchemeStore === 'system' ? 'auto' : $ColorSchemeStore) as
    | 'dark'
    | 'light'
    | 'auto';

  $effect(() => {
    if (!turnstile || !element || widgetState != 'mounted' || widgetId) return;

    if (widgetId) {
      removeWidget();

      widgetState = 'mounting';
      turnstile.ready(() => (widgetState = 'mounted'));
      return;
    }

    widgetId = turnstile.render(element, {
      sitekey: PUBLIC_TURNSTILE_SITE_KEY,
      action,
      cData,
      theme: cfColorScheme,
      callback: (token) => (response = token),
      'expired-callback': handleExpired,
      'timeout-callback': handleTimeout,
      'error-callback': handleError,
    });
  });

  onMount(() => {
    if (dev) {
      console.log('Turnstile is disabled in dev mode');
      toast.warning('Turnstile is disabled in dev mode');
      response = PUBLIC_TURNSTILE_DEV_BYPASS_VALUE;
      return;
    }

    // If turstile doesnt load, then the index.html is proabably missing the script tag (https://developers.cloudflare.com/turnstile/get-started/client-side-rendering/#explicitly-render-the-turnstile-widget)
    if (!window.turnstile) {
      console.error('Failed to load Cloudflare Turnstile resource!');
      toast.error('Failed to load Cloudflare Turnstile resource!');
      return;
    }

    turnstile = window.turnstile;

    widgetState = 'mounting';
    turnstile.ready(() => (widgetState = 'mounted'));
  });
</script>

<!-- see: https://developers.cloudflare.com/turnstile/get-started/client-side-rendering/#widget-size -->
<div id="main" bind:this={element}>
  {#if widgetState != 'mounted'}
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

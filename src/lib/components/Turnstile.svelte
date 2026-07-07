<script lang="ts">
  import Bug from '@lucide/svelte/icons/bug';
  import { dev } from '$app/env';
  import { PUBLIC_TURNSTILE_DEV_BYPASS_VALUE } from '$env/static/public';
  import { CloudflareLogo } from '@openshock/svelte-core/components/svg';
  import { Spinner } from '@openshock/svelte-core/components/ui/spinner';
  import {
    ColorScheme,
    colorScheme,
  } from '@openshock/svelte-core/state/color-scheme-state.svelte.js';
  import { onMount } from 'svelte';
  import { toast } from 'svelte-sonner';
  import { backendMetadata } from '$lib/state/backend-metadata-state.svelte';

  interface Props {
    action: string;
    cData?: string;
    onResponse: (response: string | null) => void;
  }

  let { action, cData, onResponse }: Props = $props();

  let element: HTMLDivElement;

  let mounted = $state<boolean>(false);
  let widgetId: string | undefined;
  let disabled = $state(false);

  function invalidateResponse() {
    onResponse(null);
  }

  onMount(() => {
    if (dev) {
      onResponse(PUBLIC_TURNSTILE_DEV_BYPASS_VALUE);
      return;
    }

    let cancelled = false;

    if (!backendMetadata.state) {
      console.error('Backend metadata is not set!');
      return;
    }

    const siteKey = backendMetadata.state?.turnstileSiteKey;

    if (!siteKey) {
      console.info('Backend did not provide a Turnstile site key! Assuming its disabled.');
      disabled = true;
      return;
    }

    // Check that Cloudflare Turnstile has been loaded.
    // If `window.turnstile` is undefined, it usually means the <script> tag wasn't injected.
    // See: https://developers.cloudflare.com/turnstile/get-started/client-side-rendering/#explicitly-render-the-turnstile-widget
    if (!window.turnstile) {
      console.error('Failed to load Cloudflare Turnstile');
      toast.error('Internal Error');
      return;
    }

    window.turnstile.ready(() => {
      if (cancelled) return;
      mounted = true;
      const theme = colorScheme.value === ColorScheme.System ? 'auto' : colorScheme.value;
      widgetId = window.turnstile!.render(element, {
        sitekey: siteKey,
        action,
        cData,
        theme,
        callback: onResponse,
        'expired-callback': invalidateResponse,
        'timeout-callback': invalidateResponse,
        'error-callback': invalidateResponse,
      });
    });

    return () => {
      cancelled = true;
      if (widgetId) window.turnstile?.remove(widgetId);
    };
  });
</script>

<!-- see: https://developers.cloudflare.com/turnstile/get-started/client-side-rendering/#widget-size -->
<div
  class="mx-auto flex h-16.25 max-w-screen min-w-75 justify-center overflow-hidden"
  bind:this={element}
>
  {#if !mounted}
    <!-- Turnstile placeholder -->
    <div
      class="flex h-full items-center justify-center gap-3 border border-[#e0e0e0] bg-[#fafafa] p-3 select-none dark:border-[#666] dark:bg-[#222]"
    >
      {#if dev || disabled}
        <Bug />
        <span> Turnstile disabled </span>
      {:else}
        <Spinner class="size-8" />
        <span> Loading... </span>
      {/if}
      <a
        class="mb-auto ml-auto h-7 w-auto text-[#666] dark:text-[#999]"
        href="https://www.cloudflare.com/products/turnstile/?utm_source=turnstile&utm_campaign=widget"
        target="_blank"
        rel="noopener noreferrer"
      >
        <CloudflareLogo class="mb-px h-6.5" />
      </a>
    </div>
  {/if}
</div>

<script lang="ts">
  import Bug from '@lucide/svelte/icons/bug';
  import { dev } from '$app/environment';
  import { PUBLIC_TURNSTILE_DEV_BYPASS_VALUE } from '$env/static/public';
  import CloudflareLogo from '$lib/components/svg/CloudflareLogo.svelte';
  import LoadingCircle from '$lib/components/svg/LoadingCircle.svelte';
  import { ColorScheme, colorScheme } from '$lib/state/color-scheme-state.svelte';
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
  let widgetId = $state<string | undefined>();

  function invalidateResponse() {
    onResponse(null);
  }

  function renderTurnstile() {
    mounted = true;

    const theme = colorScheme.value === ColorScheme.System ? 'auto' : colorScheme.value;

    widgetId = window.turnstile!.render(element, {
      sitekey: backendMetadata.state!.turnstileSiteKey!,
      action,
      cData,
      theme,
      callback: onResponse,
      'expired-callback': invalidateResponse,
      'timeout-callback': invalidateResponse,
      'error-callback': invalidateResponse,
    });
  }

  onMount(() => {
    if (dev) {
      onResponse(PUBLIC_TURNSTILE_DEV_BYPASS_VALUE);
      return;
    }
    if (!backendMetadata.state?.turnstileSiteKey) {
      console.error('Backend did not provide a Turnstile site key!');
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

    window.turnstile.ready(renderTurnstile);

    return () => {
      if (widgetId) window.turnstile?.remove(widgetId);
    };
  });
</script>

<!-- see: https://developers.cloudflare.com/turnstile/get-started/client-side-rendering/#widget-size -->
<div
  class="mx-auto flex h-[65px] max-w-screen min-w-[300px] justify-center overflow-hidden"
  bind:this={element}
>
  {#if !mounted}
    <!-- Turnstile placeholder -->
    <div
      class="flex h-full items-center justify-center gap-3 border border-[#e0e0e0] bg-[#fafafa] p-3 select-none dark:border-[#666] dark:bg-[#222]"
    >
      {#if dev}
        <Bug />
        <span> Turnstile disabled </span>
      {:else}
        <LoadingCircle />
        <span> Loading... </span>
      {/if}
      <a
        class="mb-auto ml-auto h-7 w-auto text-[#666] dark:text-[#999]"
        href="https://www.cloudflare.com/products/turnstile/?utm_source=turnstile&utm_campaign=widget"
        target="_blank"
        rel="noreferrer"
      >
        <CloudflareLogo class="mb-px h-[26px]" />
      </a>
    </div>
  {/if}
</div>

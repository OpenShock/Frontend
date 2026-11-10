<script lang="ts">
  import { m } from '#lib/paraglide/messages.js';
  import { ParaglideMessage } from '@inlang/paraglide-js-svelte';
  import { page } from '$app/state';
  import { PUBLIC_DEVELOPMENT_BANNER } from '$app/env/public';
  import { getLocale, localizeUrl, locales, type Locale } from '#lib/paraglide/runtime.js';
  import type { Path } from '$app/types';
  import {
    BasicTags,
    OpenGraphTags,
    TwitterSummaryTags,
  } from '@openshock/svelte-core/components/metadata';
  import { SidebarProvider } from '@openshock/svelte-core/components/ui/sidebar';
  import { Toaster } from '@openshock/svelte-core/components/ui/sonner';
  import { buildMetaData } from '#lib/metadata.js';
  import { getSiteURL } from '#lib/utils/url.js';
  import { onMount, untrack, type Snippet } from 'svelte';
  import { maybePromptTelemetryConsent } from '#lib/telemetry/consent-prompt.js';
  import Footer from './Footer.svelte';
  import Header from './Header.svelte';
  import Sidebar from './Sidebar.svelte';
  import '../app.css';
  import { IsMobile } from '@openshock/svelte-core/hooks';
  import { DialogManager } from '@openshock/svelte-core/components/dialog-manager';
  import { TooltipProvider } from '@openshock/svelte-core/components/ui/tooltip';
  import type { LayoutData } from './$types';

  interface Props {
    children?: Snippet;
    data: LayoutData;
  }

  let { children, data }: Props = $props();

  let meta = $derived(buildMetaData(page.url));
  // The landing page has a URL per language, e.g. `/de`, and the bare `/` redirects to one of them.
  const isLandingPage = $derived(page.route.id === '/');
  const defaultHomeURL = getSiteURL('' as Path);
  const homeURL = (locale: Locale) => localizeUrl(defaultHomeURL, { locale }).href;

  const mobile = new IsMobile();
  // Seeded from the sidebar:state cookie (read in +layout.server.ts) so SSR
  // renders the persisted state and there's no flash on hydration.
  let sidebarOpen = $state(untrack(() => data.sidebarOpen));
  const isOpen = $derived(mobile.current ? false : sidebarOpen);

  onMount(() => maybePromptTelemetryConsent());
</script>

<BasicTags {...meta} />
<OpenGraphTags
  type="website"
  {...meta}
  url={isLandingPage ? homeURL(getLocale()) : page.url.origin}
/>
<TwitterSummaryTags type="summary" {...meta} site="@OpenShockORG" creator="@OpenShockORG" />

<svelte:head>
  {#if isLandingPage}
    <link rel="canonical" href={homeURL(getLocale())} />
    {#each locales.filter((locale) => locale !== 'uwu') as locale (locale)}
      <link rel="alternate" hreflang={locale} href={homeURL(locale)} />
    {/each}
    <link rel="alternate" hreflang="x-default" href={defaultHomeURL.href} />
  {/if}
</svelte:head>

<Toaster position="top-center" />

<TooltipProvider delayDuration={250}>
  <DialogManager />

  <SidebarProvider open={isOpen} onOpenChange={(v) => (sidebarOpen = v)}>
    <Sidebar />
    <!-- `h-svh` matches the sidebar wrapper; `100vh` left the page scrollable by the height of a phone's URL bar.
         `w-full` because `100vw` counts the scrollbar. -->
    <div class="flex h-svh w-full flex-1 flex-col overflow-hidden">
      {#if PUBLIC_DEVELOPMENT_BANNER}
        <div class="top-0 left-0 z-1 flex-none bg-[orangered] text-center text-white">
          <p>
            <ParaglideMessage message={m.dev_banner}>
              {#snippet b({ children })}<b>{@render children?.()}</b>{/snippet}
              {#snippet u({ children })}<u>{@render children?.()}</u>{/snippet}
            </ParaglideMessage>
          </p>
        </div>
      {/if}
      <Header />
      <main class="min-h-0 flex-1 overflow-x-hidden">
        {@render children?.()}
      </main>
      <Footer />
    </div>
  </SidebarProvider>
</TooltipProvider>

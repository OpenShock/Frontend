<script lang="ts">
  import { page } from '$app/state';
  import { PUBLIC_DEVELOPMENT_BANNER } from '$env/static/public';
  import {
    BasicTags,
    OpenGraphTags,
    TwitterSummaryTags,
  } from '@openshock/svelte-core/components/metadata/index.js';
  import { SidebarProvider } from '@openshock/svelte-core/components/ui/sidebar/index.js';
  import { Toaster } from '@openshock/svelte-core/components/ui/sonner/index.js';
  import { buildMetaData } from '$lib/metadata';
  import { onMount, untrack, type Snippet } from 'svelte';
  import { maybePromptTelemetryConsent } from '$lib/telemetry/consent-prompt';
  import Footer from './Footer.svelte';
  import Header from './Header.svelte';
  import Sidebar from './Sidebar.svelte';
  import WelcomeScreen from './WelcomeScreen.svelte';
  import '../app.css';
  import { IsMobile } from '@openshock/svelte-core/hooks/is-mobile.svelte.js';
  import { DialogManager } from '@openshock/svelte-core/components/dialog-manager/index.js';
  import { TooltipProvider } from '@openshock/svelte-core/components/ui/tooltip/index.js';
  import type { LayoutData } from './$types';

  interface Props {
    children?: Snippet;
    data: LayoutData;
  }

  let { children, data }: Props = $props();

  let meta = $derived(buildMetaData(page.url));

  const mobile = new IsMobile();
  // Seeded from the sidebar:state cookie (read in +layout.server.ts) so SSR
  // renders the persisted state and there's no flash on hydration.
  let sidebarOpen = $state(untrack(() => data.sidebarOpen));
  const isOpen = $derived(mobile.current ? false : sidebarOpen);

  let welcomeOpen = $state(untrack(() => data.showWelcome));

  onMount(() => maybePromptTelemetryConsent());
</script>

<BasicTags {...meta} />
<OpenGraphTags type="website" {...meta} url={page.url.origin} />
<TwitterSummaryTags type="summary" {...meta} site="@OpenShockORG" creator="@OpenShockORG" />

<Toaster position="top-center" />

<TooltipProvider delayDuration={250}>
  <DialogManager />

  {#if welcomeOpen}
    <WelcomeScreen
      close={() => {
        welcomeOpen = false;
      }}
    />
  {/if}

  <SidebarProvider open={isOpen} onOpenChange={(v) => (sidebarOpen = v)}>
    <Sidebar />
    <div class="flex h-screen w-screen flex-1 flex-col overflow-hidden">
      {#if PUBLIC_DEVELOPMENT_BANNER === 'true'}
        <div class="top-0 left-0 z-1 flex-none bg-[orangered] text-center text-white">
          <p>
            This is the OpenShock <b>DEVELOPMENT</b> environment. <u>No data is saved</u>, and
            regularly overwritten by production data
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

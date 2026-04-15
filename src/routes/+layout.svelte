<script lang="ts">
  import { page } from '$app/state';
  import { PUBLIC_DEVELOPMENT_BANNER } from '$env/static/public';
  import { BasicTags, OpenGraphTags, TwitterSummaryTags } from '$lib/components/metadata';
  import { SidebarProvider } from '$lib/components/ui/sidebar';
  import { Toaster } from '$lib/components/ui/sonner';
  import { buildMetaData } from '$lib/metadata';
  import { type Snippet } from 'svelte';
  import Footer from './Footer.svelte';
  import Header from './Header.svelte';
  import Sidebar from './Sidebar.svelte';
  import '../app.css';
  import { IsMobile } from '$lib/hooks/is-mobile.svelte';
  import { PersistedState } from '$lib/state/classes/persisted-state.svelte';
  import DialogManager from '$lib/components/dialog-manager/dialog-manager.svelte';

  interface Props {
    children?: Snippet;
  }

  let { children }: Props = $props();

  let meta = $derived(buildMetaData(page.url));

  const mobile = new IsMobile();
  const sidebarOpen = new PersistedState('sidebarOpen', false);
  const isOpen = $derived(mobile.current ? false : sidebarOpen.value);
</script>

<BasicTags {...meta} />
<OpenGraphTags type="website" {...meta} url={page.url.origin} />
<TwitterSummaryTags type="summary" {...meta} site="@OpenShockORG" creator="@OpenShockORG" />

<Toaster position="top-center" />

<DialogManager />

<SidebarProvider open={isOpen} onOpenChange={(v) => (sidebarOpen.value = v)}>
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

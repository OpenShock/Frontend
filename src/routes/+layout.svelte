<script lang="ts">
  import { page } from '$app/state';
  import { PUBLIC_DEVELOPMENT_BANNER } from '$env/static/public';
  import { BasicTags, OpenGraphTags, TwitterSummaryTags } from '$lib/components/metadata';
  import { SidebarProvider } from '$lib/components/ui/sidebar';
  import { Toaster } from '$lib/components/ui/sonner';
  import { buildMetaData } from '$lib/metadata';
  import { type Snippet, onMount } from 'svelte';
  import Footer from './Footer.svelte';
  import Header from './Header.svelte';
  import Sidebar from './Sidebar.svelte';
  import '../app.css';
  import { browser } from '$app/environment';
  import { initializeApp } from '$lib/init';
  import { isMobile } from '$lib/utils/compatibility';

  interface Props {
    children?: Snippet;
  }

  let { children }: Props = $props();

  let meta = $derived(buildMetaData(page.url));

  let isOpen = $state(
    !browser || isMobile ? false : localStorage.getItem('sidebarOpen') === 'true'
  );
  $effect(() => {
    if (!isMobile) localStorage.setItem('sidebarOpen', isOpen ? 'true' : 'false');
  });

  onMount(() => initializeApp(!page.url.pathname.startsWith('/logout')));
</script>

<BasicTags {...meta} />
<OpenGraphTags type="website" {...meta} url={page.url.origin} />
<TwitterSummaryTags type="summary" {...meta} site="@OpenShockORG" creator="@OpenShockORG" />

<Toaster />

<SidebarProvider bind:open={isOpen}>
  <Sidebar />
  <div class="flex h-screen w-screen flex-1 flex-col overflow-hidden">
    {#if PUBLIC_DEVELOPMENT_BANNER === 'true'}
      <div class="top-0 left-0 z-1 bg-[orangered] text-center text-white">
        <p>
          This is the OpenShock <b>DEVELOPMENT</b> environment. <u>No data is saved</u>, and
          regularly overwritten by production data
        </p>
      </div>
    {/if}
    <Header />
    <main class="flex-1">
      {@render children?.()}
    </main>
    <Footer />
  </div>
</SidebarProvider>

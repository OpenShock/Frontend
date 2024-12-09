<script lang="ts">
  import { page } from '$app/stores';
  import AppSidebar from '$lib/components/layout/AppSidebar.svelte';
  import Footer from '$lib/components/layout/Footer.svelte';
  import Header from '$lib/components/layout/Header.svelte';
  import { BasicTags, OpenGraphTags, TwitterSummaryTags } from '$lib/components/metadata';
  import * as Sidebar from '$lib/components/ui/sidebar';
  import { Toaster } from '$lib/components/ui/sonner';
  import { buildMetaData } from '$lib/metadata';
  import { initializeSignalR } from '$lib/signalr';
  import { initializeStores } from '$lib/stores';
  import { UserStore } from '$lib/stores/UserStore';
  import type { Snippet } from 'svelte';
  import { RankType } from '$lib/api/internal/v1';
  import { browser, dev } from '$app/environment';
  import '../app.pcss';

  type Props = {
    children?: Snippet;
  };

  let { children }: Props = $props();

  if (browser) {
    initializeStores();
    initializeSignalR();
  }

  let meta = $derived(buildMetaData($page.url));

  let isOpen = $state(false);
  let isLoggedIn = $derived($UserStore?.self !== null);
  let currentUserRank = $derived($UserStore?.self?.rank ?? null);
</script>

<BasicTags {...meta} />
<OpenGraphTags type="website" {...meta} url={$page.url.origin} />
<TwitterSummaryTags type="summary" {...meta} site="@OpenShockORG" creator="@OpenShockORG" />

<Toaster />

<Sidebar.Provider
  open={isOpen && isLoggedIn}
  onOpenChange={(open) => (isOpen = open)}
  controlledOpen={true}
>
  <AppSidebar currentUserRank={currentUserRank ?? RankType.User} />
  <div class="flex-1 flex flex-col min-h-screen">
    <Header />
    <main class="flex-1">
      {@render children?.()}
    </main>
    <Footer />
  </div>
</Sidebar.Provider>

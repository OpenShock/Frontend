<script lang="ts">
  import { page } from '$app/stores';
  import AppSidebar from '$lib/components/layout/AppSidebar.svelte';
  import Footer from '$lib/components/layout/Footer.svelte';
  import Header from '$lib/components/layout/Header.svelte';
  import OpenGraphTags from '$lib/components/metadata/OpenGraphTags.svelte';
  import TwitterSummaryTags from '$lib/components/metadata/Twitter/TwitterSummaryTags.svelte';
  import * as Sidebar from '$lib/components/ui/sidebar';
  import { Toaster } from '$lib/components/ui/sonner';
  import { buildMetaData } from '$lib/metadata';
  import { initializeSignalR } from '$lib/signalr';
  import { initializeStores } from '$lib/stores';
  import { UserStore } from '$lib/stores/UserStore';
  import type { Snippet } from 'svelte';
  import '../app.pcss';
  import { RankType } from '$lib/api/internal/v1';
  import { browser } from '$app/environment';

  type Props = {
    children?: Snippet;
  };

  let { children }: Props = $props();

  if (browser) {
    initializeStores();
    initializeSignalR();
  }

  const meta = buildMetaData($page);

  let currentUserRank = $derived($UserStore?.self?.rank ?? null);
</script>

<Toaster />

<TwitterSummaryTags type="summary" {...meta} site="@OpenShockORG" creator="@OpenShockORG" />
<OpenGraphTags type="website" {...meta} url={$page.url.origin} />

<Sidebar.Provider>
  <AppSidebar currentUserRank={currentUserRank ?? RankType.User} />
  <div class="flex-1 flex flex-col min-h-screen">
    <Header />
    <main class="flex-1">
      {@render children?.()}
    </main>
    <Footer />
  </div>
</Sidebar.Provider>

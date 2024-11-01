<script lang="ts">
  import '../app.pcss';
  import AppSidebar from '$lib/components/layout/AppSidebar.svelte';
  import Footer from '$lib/components/layout/Footer.svelte';
  import Header from '$lib/components/layout/Header.svelte';
  import OpenGraphTags from '$lib/components/metadata/OpenGraphTags.svelte';
  import TwitterSummaryTags from '$lib/components/metadata/Twitter/TwitterSummaryTags.svelte';
  import * as Sidebar from '$lib/components/ui/sidebar';
  import { Toaster } from '$lib/components/ui/sonner'
  import { page } from '$app/stores';
  import { buildMetaData } from '$lib/metadata';
  import { initializeStores } from '$lib/stores';
  import { initializeSignalR } from '$lib/signalr';
  import type { Snippet } from 'svelte';
  import { UserStore } from '$lib/stores/UserStore';

  let { children }: { children: Snippet } = $props();

  initializeStores();
  initializeSignalR();

  const meta = buildMetaData($page);

  let currentUserRank = $derived($UserStore?.self?.rank ?? null);
</script>

<Toaster />

<TwitterSummaryTags type="summary" {...meta} site="@OpenShockORG" creator="@OpenShockORG" />
<OpenGraphTags type="website" {...meta} url={$page.url.origin} />

<Header />
  <Sidebar.Provider>
    {#if currentUserRank !== null}
      <AppSidebar {currentUserRank} />
    {/if}
    <main>
      {@render children()}
    </main>
  </Sidebar.Provider>
<Footer />

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
  import { RankType } from '$lib/api/internal/v1';
  import { browser, building, dev } from '$app/environment';
  import { PUBLIC_SITE_DOMAIN } from '$env/static/public';
  import '../app.pcss';

  type Props = {
    children?: Snippet;
  };

  let { children }: Props = $props();

  if (browser) {
    initializeStores();
    initializeSignalR();
  }

  let domain = $derived<string>(building ? `https://${PUBLIC_SITE_DOMAIN}` : $page.url.host); // TODO: Find a better way to get the host while prerendering?

  let meta = $derived(buildMetaData({ domain, path: $page.url.pathname }));

  let isOpen = $state(false);
  let isLoggedIn = $derived($UserStore?.self !== null);
  let currentUserRank = $derived($UserStore?.self?.rank ?? null);
</script>

<svelte:head>
  {#if !dev}
    <script src="https://challenges.cloudflare.com/turnstile/v0/api.js"></script>
  {/if}
</svelte:head>

<Toaster />

<TwitterSummaryTags type="summary" {...meta} site="@OpenShockORG" creator="@OpenShockORG" />
<OpenGraphTags type="website" {...meta} url={domain} />

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

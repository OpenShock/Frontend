<script lang="ts">
  import { page } from '$app/state';
  import AppSidebar from '$lib/components/layout/AppSidebar.svelte';
  import Footer from '$lib/components/layout/Footer.svelte';
  import Header from '$lib/components/layout/Header.svelte';
  import { BasicTags, OpenGraphTags, TwitterSummaryTags } from '$lib/components/metadata';
  import { SidebarProvider } from '$lib/components/ui/sidebar';
  import { Toaster } from '$lib/components/ui/sonner';
  import { buildMetaData } from '$lib/metadata';
  import { initializeSignalR } from '$lib/signalr';
  import { initializeStores } from '$lib/stores';
  import { UserStore } from '$lib/stores/UserStore';
  import type { Snippet } from 'svelte';
  import { RoleType } from '$lib/api/internal/v1';
  import { browser } from '$app/environment';
  import '../app.css';

  type Props = {
    children?: Snippet;
  };

  let { children }: Props = $props();

  if (browser) {
    initializeStores();
    initializeSignalR();
  }

  let meta = $derived(buildMetaData(page.url));

  let isOpen = $state(false);
  let isLoggedIn = $derived($UserStore?.self !== null);
  let currentUserRoles = $derived($UserStore?.self?.roles ?? []);
</script>

<BasicTags {...meta} />
<OpenGraphTags type="website" {...meta} url={page.url.origin} />
<TwitterSummaryTags type="summary" {...meta} site="@OpenShockORG" creator="@OpenShockORG" />

<Toaster />

<SidebarProvider bind:open={() => isOpen && isLoggedIn, (o) => (isOpen = o)}>
  <AppSidebar {currentUserRoles} />
  <div class="flex h-screen w-screen flex-1 flex-col overflow-hidden">
    <Header />
    <main class="flex-1">
      {@render children?.()}
    </main>
    <Footer />
  </div>
</SidebarProvider>

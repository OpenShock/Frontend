<script lang="ts">
  import '../app.postcss';
  import { computePosition, autoUpdate, flip, shift, offset, arrow } from '@floating-ui/dom';
  import Footer from '$lib/components/layout/Footer.svelte';
  import Header from '$lib/components/layout/Header.svelte';
  import Sidebar from '$lib/components/layout/Sidebar.svelte';
  import OpenGraphTags from '$lib/components/metadata/OpenGraphTags.svelte';
  import TwitterSummaryTags from '$lib/components/metadata/Twitter/TwitterSummaryTags.svelte';
  import { modalRegistry } from '$lib/modals';
  import { page } from '$app/stores';
  import { buildMetaData } from '$lib/metadata';
  import { initializeStores } from '$lib/stores';
  import { initializeSignalR } from '$lib/signalr';
  import type { Snippet } from 'svelte';

  let { children }: { children: Snippet } = $props();

  initializeStores();
  initializeSignalR();

  const meta = buildMetaData($page);
</script>

<Modal components={modalRegistry} />
<Toast position="bl" max={5} />

<TwitterSummaryTags type="summary" {...meta} site="@OpenShockORG" creator="@OpenShockORG" />
<OpenGraphTags type="website" {...meta} url={$page.url.origin} />

<header>
  <Header />
</header>
<div>
  <aside>
    <Sidebar />
  </aside>
  <main>
    {@render children()}
  </main>
</div>
<footer>
  <Footer />
</footer>

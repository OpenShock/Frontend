<script lang="ts">
  import '../app.css';
  import {
    computePosition,
    autoUpdate,
    flip,
    shift,
    offset,
    arrow,
  } from '@skeletonlabs/floating-ui-svelte';
  import { Modal, Toast, initializeStores, storePopup } from '@skeletonlabs/skeleton';
  import Footer from '$lib/components/layout/Footer.svelte';
  import Header from '$lib/components/layout/Header.svelte';
  import Sidebar from '$lib/components/layout/Sidebar.svelte';
  import OpenGraphTags from '$lib/components/metadata/OpenGraphTags.svelte';
  import TwitterSummaryTags from '$lib/components/metadata/Twitter/TwitterSummaryTags.svelte';
  import { modalRegistry } from '$lib/modals';
  import { page } from '$app/stores';
  import { buildMetaData } from '$lib/metadata';

  storePopup.set({ computePosition, autoUpdate, flip, shift, offset, arrow });
  initializeStores();

  const meta = buildMetaData($page);
</script>

<Modal components={modalRegistry} />
<Toast position="bl" max={5} />

<TwitterSummaryTags type="summary" {...meta} site="@OpenShockORG" creator="@OpenShockORG" />
<OpenGraphTags type="website" {...meta} url={$page.url.origin} />

<div class="w-full h-full flex flex-col overflow-hidden">
  <Header />
  <div class="flex flex-row flex-1 overflow-hidden">
    <Sidebar />
    <div class="flex flex-col flex-1 overflow-y-auto">
      <main class="flex-auto">
        <slot />
      </main>
      <Footer />
    </div>
  </div>
</div>

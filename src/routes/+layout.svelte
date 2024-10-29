<script lang="ts">
  import '../app.postcss';
  import { computePosition, autoUpdate, flip, shift, offset, arrow } from '@floating-ui/dom';
  import { AppShell, Modal, Toast, initializeStores, storePopup } from '@skeletonlabs/skeleton';
  import Footer from '$lib/components/layout/Footer.svelte';
  import Header from '$lib/components/layout/Header.svelte';
  import Sidebar from '$lib/components/layout/Sidebar.svelte';
  import OpenGraphTags from '$lib/components/metadata/OpenGraphTags.svelte';
  import TwitterSummaryTags from '$lib/components/metadata/Twitter/TwitterSummaryTags.svelte';
  import { modalRegistry } from '$lib/modals';
  import { page } from '$app/stores';
  import { buildMetaData } from '$lib/metadata';
  
  interface Props {
    children?: import('svelte').Snippet;
  }

  let { children }: Props = $props();

  storePopup.set({ computePosition, autoUpdate, flip, shift, offset, arrow });
  initializeStores();

  const meta = buildMetaData($page);
</script>

<Modal components={modalRegistry} />
<Toast position="bl" max={5} />

<TwitterSummaryTags type="summary" {...meta} site="@OpenShockORG" creator="@OpenShockORG" />
<OpenGraphTags type="website" {...meta} url={$page.url.origin} />

<AppShell>
  {#snippet header()}
    <Header  />
  {/snippet}
  {#snippet sidebarLeft()}
    <Sidebar  />
  {/snippet}
  {@render children?.()}

  {#snippet pageFooter()}
    <Footer />
  {/snippet}
</AppShell>

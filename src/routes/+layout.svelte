<script lang="ts">
  import '../app.postcss';
  import { computePosition, autoUpdate, flip, shift, offset, arrow } from '@floating-ui/dom';
  import {
    AppShell,
    Modal,
    Toast,
    getToastStore,
    initializeStores,
    storePopup,
  } from '@skeletonlabs/skeleton';
  import Footer from '$lib/components/layout/Footer.svelte';
  import Header from '$lib/components/layout/Header.svelte';
  import { PUBLIC_FRONTEND_URL } from '$env/static/public';
  import OpenGraphTags from '$lib/components/metadata/OpenGraphTags.svelte';
  import TwitterSummaryTags from '$lib/components/metadata/Twitter/TwitterSummaryTags.svelte';
  import { modalRegistry } from '$lib/modals';

  storePopup.set({ computePosition, autoUpdate, flip, shift, offset, arrow });
  initializeStores();

  const toastStore = getToastStore();
</script>

<Modal components={modalRegistry} />
<Toast position="bl" max={5} />

<TwitterSummaryTags
  type="summary"
  title="OpenShock"
  description="OpenShock is a free and open-source shock collar system."
  image={{ src: PUBLIC_FRONTEND_URL + '/logo.svg', alt: 'OpenShock Logo' }}
  site="@OpenShockORG"
  creator="@OpenShockORG"
/>
<OpenGraphTags
  type="website"
  title="OpenShock"
  description="OpenShock is a free and open-source shock collar system."
  image={{ src: PUBLIC_FRONTEND_URL + '/logo.svg', alt: 'OpenShock Logo' }}
  url={PUBLIC_FRONTEND_URL}
/>

<AppShell>
  <Header slot="header" />
  <slot />
  <Footer slot="pageFooter" />
</AppShell>

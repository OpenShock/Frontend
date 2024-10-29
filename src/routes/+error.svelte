<script lang="ts">
  import { afterNavigate } from '$app/navigation';
  import { base } from '$app/paths';
  import { page } from '$app/stores';
  import BasicTags from '$lib/components/metadata/BasicTags.svelte';
  import OpenGraphTags from '$lib/components/metadata/OpenGraphTags.svelte';
  import TwitterSummaryTags from '$lib/components/metadata/Twitter/TwitterSummaryTags.svelte';

  let previousPage: string = $state(base);

  afterNavigate(({ from }) => {
    previousPage = from?.url.pathname || previousPage;
  });

  let meta = $derived({
    title: 'Service Unavailable',
    description: 'OpenShock is currently unavailable',
    image: {
      src: '/logo.svg',
      alt: 'OpenShock Logo',
    },
  });
</script>

<BasicTags {...meta} />
<TwitterSummaryTags type="summary" {...meta} site="@OpenShockORG" creator="@OpenShockORG" />
<OpenGraphTags
  type="website"
  {...meta}
  url={$page.url.origin}
  siteName="OpenShock"
  determiner="auto"
  metaLocale="en_US"
/>

<div class="absolute left-1/2 top-1/2 -translate-x-[50%] -translate-y-[50%] text-center">
  <div class="text-9xl">{$page.status}</div>
  <div class="big">
    {$page.error?.message ?? 'Something went wrong.'}
    <br />
    <a href={previousPage}>Go back</a>
  </div>
</div>

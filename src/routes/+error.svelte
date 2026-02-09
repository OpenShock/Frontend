<script lang="ts">
  import { afterNavigate } from '$app/navigation';
  import { asset, resolve } from '$app/paths';
  import { page } from '$app/state';
  import type { Pathname } from '$app/types';
  import { PUBLIC_SITE_NAME } from '$env/static/public';
  import { BasicTags, OpenGraphTags, TwitterSummaryTags } from '$lib/components/metadata';

  let previousPage = $state<Pathname>('/');

  afterNavigate(({ from }) => {
    previousPage = from?.url?.pathname || previousPage;
  });

  const meta = {
    title: 'Service Unavailable',
    description: 'OpenShock is currently unavailable',
    image: {
      src: asset('/logo.svg'),
      alt: 'OpenShock Logo',
    },
  };
</script>

<BasicTags {...meta} />
<OpenGraphTags
  type="website"
  {...meta}
  url={page.url.origin}
  siteName={PUBLIC_SITE_NAME}
  determiner="auto"
  metaLocale="en_US"
/>
<TwitterSummaryTags type="summary" {...meta} site="@OpenShockORG" creator="@OpenShockORG" />

<div class="absolute top-1/2 left-1/2 -translate-1/2 text-center">
  <div class="text-9xl">{page.status}</div>
  <div class="big">
    {page.error?.message ?? 'Something went wrong.'}
    <br />
    <a href={resolve(previousPage)}>Go back</a>
  </div>
</div>

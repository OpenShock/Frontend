<script lang="ts">
  import { afterNavigate } from '$app/navigation';
  import { asset } from '$app/paths';
  import { page } from '$app/state';
  import { PUBLIC_SITE_NAME } from '$env/static/public';
  import { BasicTags, OpenGraphTags, TwitterSummaryTags } from '$lib/components/metadata';
  import { isValidRedirectURL, prefixBase } from '$lib/utils/url';

  let previousPath = $state<string>(prefixBase('/'));

  afterNavigate(({ from }) => {
    if (from !== null && isValidRedirectURL(from.url)) {
      previousPath = from.url.pathname;
    }
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
    <!-- prefixBase is used here because resolve() requires a route ID, not a plain pathname -->
    <!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
    <a href={previousPath}>Go back</a>
  </div>
</div>

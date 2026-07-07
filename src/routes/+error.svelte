<script lang="ts">
  import { afterNavigate } from '$app/navigation';
  import { asset, resolve } from '$app/paths';
  import { page } from '$app/state';
  import { PUBLIC_SITE_NAME } from '$env/static/public';
  import {
    BasicTags,
    OpenGraphTags,
    TwitterSummaryTags,
  } from '@openshock/svelte-core/components/metadata';
  import ArrowLeft from '@lucide/svelte/icons/arrow-left';
  import { isValidRedirectURL } from '$lib/utils/url';

  let previousPath = $state<string>(resolve('/'));

  afterNavigate(({ from }) => {
    if (from?.url != null && isValidRedirectURL(from.url)) {
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

<div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
  <div class="text-primary/20 select-none text-[8rem] font-black leading-none sm:text-[12rem]">
    {page.status}
  </div>
  <p class="text-foreground mt-2 text-xl font-semibold">
    {page.error?.message ?? 'Something went wrong.'}
  </p>
  <p class="text-muted-foreground mt-1 text-sm">
    {page.status === 404
      ? "The page you're looking for doesn't exist."
      : 'An unexpected error occurred.'}
  </p>
  <!-- eslint-disable svelte/no-navigation-without-resolve -->
  <a
    href={previousPath}
    class="bg-primary text-primary-foreground hover:bg-primary/90 mt-6 inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors"
  >
    <ArrowLeft class="size-4" /> Go back
  </a>
  <!-- eslint-enable svelte/no-navigation-without-resolve -->
</div>

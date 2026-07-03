<script lang="ts">
  import Plus from '@lucide/svelte/icons/plus';
  import RotateCcw from '@lucide/svelte/icons/rotate-ccw';
  import Link2 from '@lucide/svelte/icons/link-2';
  import Clock from '@lucide/svelte/icons/clock';
  import CircleAlert from '@lucide/svelte/icons/circle-alert';
  import Infinity_ from '@lucide/svelte/icons/infinity';
  import { goto } from '$app/navigation';
  import { resolve } from '$app/paths';
  import { shareLinksList } from '$lib/api';
  import type { OwnPublicShareResponse } from '$lib/api';
  import { Container } from '@openshock/svelte-core/components/index.js';
  import { CopyInput } from '@openshock/svelte-core/components/index.js';
  import { EmptyState } from '@openshock/svelte-core/components/index.js';
  import { Spinner } from '@openshock/svelte-core/components/ui/spinner/index.js';
  import { Button } from '@openshock/svelte-core/components/ui/button/index.js';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
  import {
    durationBetween,
    formatDuration,
    formatElapsed,
  } from '@openshock/svelte-core/utils/index.js';
  import { getSiteShortURL } from '$lib/utils/url';
  import { onMount } from 'svelte';
  import DataTableActions from './data-table-actions.svelte';
  import { registerBreadcrumbs } from '$lib/state/breadcrumbs-state.svelte';
  import CreatePublicShareDialog from './dialog-publicshare-create.svelte';
  import { PageHeader } from '@openshock/svelte-core/components/index.js';

  registerBreadcrumbs(() => [{ label: 'Public Shares' }]);

  let data = $state<OwnPublicShareResponse[]>([]);
  let loading = $state(true);
  let showAddShareModal = $state<boolean>(false);

  const sortedShares = $derived(
    [...data].sort((a, b) => b.createdOn.epochMilliseconds - a.createdOn.epochMilliseconds)
  );

  function refreshPublicShares() {
    loading = true;
    shareLinksList()
      .then((publicShares) => {
        if (publicShares.data === null) {
          console.warn('Failed to get share links, but response was success!');
          return;
        }
        data = publicShares.data;
      })
      .catch(handleApiError)
      .finally(() => {
        loading = false;
      });
  }

  const expiryToneClasses = {
    neutral: 'text-muted-foreground ring-border',
    warning: 'text-amber-600 dark:text-amber-400 ring-amber-500/30',
    danger: 'text-red-600 dark:text-red-400 ring-red-500/30',
  } as const;

  function expiryInfo(expiresOn: Temporal.Instant | null | undefined) {
    if (!expiresOn) {
      return { label: 'Never expires', tone: 'neutral' as const };
    }
    const now = Temporal.Now.instant();
    const isExpired = expiresOn.epochMilliseconds <= now.epochMilliseconds;
    if (isExpired) {
      return { label: 'Expired', tone: 'danger' as const };
    }
    return {
      label: 'Expires ' + formatDuration(durationBetween(now, expiresOn)),
      tone: 'warning' as const,
    };
  }

  onMount(() => {
    refreshPublicShares();
  });
</script>

<CreatePublicShareDialog bind:open={showAddShareModal} onCreated={refreshPublicShares} />

<Container>
  <PageHeader title="Public Shares" subtitle="A link anyone can use — no account required.">
    <Button variant="outline" onclick={refreshPublicShares}>
      <RotateCcw />
      Refresh
    </Button>
    <Button onclick={() => (showAddShareModal = true)}>
      <Plus />
      New Share
    </Button>
  </PageHeader>

  {#if loading && data.length === 0}
    <div class="flex h-64 w-full items-center justify-center">
      <Spinner class="size-8 text-gray-600 dark:text-gray-300" />
    </div>
  {:else if sortedShares.length === 0}
    <EmptyState
      icon={Link2}
      title="No public shares yet"
      description="Create a link that anyone can use to control your shockers."
    >
      <Button size="lg" onclick={() => (showAddShareModal = true)}>
        <Plus />
        New Share
      </Button>
    </EmptyState>
  {:else}
    <div
      class="grid w-full grid-cols-1 gap-4 sm:[grid-template-columns:repeat(auto-fill,minmax(18rem,1fr))]"
    >
      {#each sortedShares as share (share.id)}
        {@const url = getSiteShortURL(`/s/${share.id}`)}
        {@const exp = expiryInfo(share.expiresOn)}
        <div
          role="button"
          tabindex="0"
          onclick={() => goto(resolve(`/shares/public/${share.id}`))}
          onkeydown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              goto(resolve(`/shares/public/${share.id}`));
            }
          }}
          class="border-border/60 bg-card hover:border-primary/40 hover:bg-accent/30 group mx-auto flex w-full max-w-md cursor-pointer flex-col gap-3 rounded-lg border p-4 text-left transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none sm:mx-0 sm:max-w-none"
        >
          <div class="flex items-start justify-between gap-2">
            <h2 class="min-w-0 flex-1 truncate text-base font-semibold" title={share.name}>
              {share.name}
            </h2>
            <!-- Stop click bubbling so menu items don't trigger row navigate -->
            <div
              role="presentation"
              onclick={(e) => e.stopPropagation()}
              onkeydown={(e) => e.stopPropagation()}
              class="shrink-0"
            >
              <DataTableActions publicShare={share} onChange={refreshPublicShares} />
            </div>
          </div>

          <div role="presentation" onclick={(e) => e.stopPropagation()}>
            <CopyInput value={url.href} displayValue={url.host + url.pathname} />
          </div>

          <div
            class="text-muted-foreground mt-auto flex items-center justify-between gap-2 pt-1 text-xs"
          >
            <span class="flex items-center gap-1.5" title={share.createdOn.toString()}>
              <Clock class="size-3.5" />
              {formatElapsed(durationBetween(Temporal.Now.instant(), share.createdOn))}
            </span>
            <span
              class="flex items-center gap-1.5 rounded-full px-2 py-0.5 ring-1 ring-inset {expiryToneClasses[
                exp.tone
              ]}"
              title={share.expiresOn?.toString() ?? 'No expiry'}
            >
              {#if exp.tone === 'neutral'}
                <Infinity_ class="size-3.5" />
              {:else if exp.tone === 'danger'}
                <CircleAlert class="size-3.5" />
              {:else}
                <Clock class="size-3.5" />
              {/if}
              {exp.label}
            </span>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</Container>

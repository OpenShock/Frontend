<script lang="ts">
  import { tokensListTokensV2 } from '#lib/api/index.js';
  import type { TokenResponseV2 } from '#lib/api/index.js';
  import { resolve } from '$app/paths';
  import KeyRound from '@lucide/svelte/icons/key-round';
  import Plus from '@lucide/svelte/icons/plus';
  import RotateCcw from '@lucide/svelte/icons/rotate-ccw';
  import {
    Container,
    EmptyState,
    PageError,
    PageHeader,
    PageLoading,
  } from '@openshock/svelte-core/components';
  import { Button } from '@openshock/svelte-core/components/ui/button';
  import * as Card from '@openshock/svelte-core/components/ui/card';
  import { handleApiError } from '#lib/errorhandling/apiErrorHandling.js';
  import { toast } from 'svelte-sonner';
  import TokenActions from './token-actions.svelte';
  import { registerBreadcrumbs } from '#lib/state/breadcrumbs-state.svelte.js';
  import { formatRelativeInstantOrNull } from '#lib/utils/datetime.js';
  import { createNowTicker } from '@openshock/svelte-core/utils';

  registerBreadcrumbs(() => [
    { label: 'Settings', href: 'settings/account' },
    { label: 'API Tokens' },
  ]);

  let tokens = $derived(await tokensListTokensV2());

  const clock = createNowTicker();

  function onEdit(id: string, updater: (token: TokenResponseV2) => TokenResponseV2) {
    tokens = tokens.map((t) => (t.id === id ? updater(t) : t));
  }

  function onDeleted(id: string) {
    tokens = tokens.filter((t) => t.id !== id);
  }

  async function refresh() {
    try {
      tokens = await tokensListTokensV2();
      toast.success('Tokens refreshed successfully');
    } catch (error) {
      await handleApiError(error);
    }
  }
</script>

<Container>
  <PageHeader
    title="API Tokens"
    subtitle="API Tokens are used to authenticate with the OpenShock API."
  >
    <Button href={resolve('settings/api-tokens/new')}><Plus />Generate Token</Button>
    <Button variant="outline" onclick={refresh}><RotateCcw />Refresh</Button>
  </PageHeader>
  <Card.Content class="flex w-full flex-col space-y-4">
    <svelte:boundary onerror={(error: unknown) => handleApiError(error)}>
      {#if tokens.length === 0}
        <EmptyState
          icon={KeyRound}
          title="No API tokens"
          description="Generate a token to authenticate with the OpenShock API."
        />
      {:else}
        <div class="divide-y rounded-md border">
          {#each tokens as token (token.id)}
            {@const lastUsed = formatRelativeInstantOrNull(token.lastUsed, clock.current)}
            {@const expires = formatRelativeInstantOrNull(token.validUntil, clock.current)}
            <div class="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3">
              <div class="flex min-w-0 flex-1 items-center gap-2">
                <span class="truncate font-medium">{token.name}</span>
              </div>
              <div
                class="text-muted-foreground flex shrink-0 flex-wrap items-center gap-x-4 text-sm"
              >
                <span>
                  Created {token.createdOn.toLocaleString(undefined, { dateStyle: 'short' })}
                </span>
                <span>{lastUsed ? `Last used ${lastUsed}` : 'Never used'}</span>
                <span>{expires ? `Expires ${expires}` : 'Never expires'}</span>
              </div>

              <TokenActions {token} {onEdit} {onDeleted} />
            </div>
          {/each}
        </div>
      {/if}

      {#snippet pending()}
        <PageLoading />
      {/snippet}

      {#snippet failed(_error: unknown, reset: () => void)}
        <PageError message="Failed to load API tokens." onRetry={reset} />
      {/snippet}
    </svelte:boundary>
  </Card.Content>
</Container>

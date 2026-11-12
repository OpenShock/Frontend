<script lang="ts">
  import { m } from '#lib/paraglide/messages.js';
  import { intlLocale } from '#lib/i18n/intl.js';
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
    { label: m.sidebar_group_settings(), href: 'settings/account' },
    { label: m.sidebar_settings_api_tokens() },
  ]);

  let tokens = $state<TokenResponseV2[]>([]);
  // Awaited inside the boundary below so its pending and failed snippets cover the initial load.
  let initialLoad = $state(loadTokens());

  async function loadTokens() {
    tokens = await tokensListTokensV2();
  }

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
      toast.success(m.tokens_toast_refreshed());
    } catch (error) {
      await handleApiError(error);
    }
  }
</script>

<Container>
  <PageHeader title={m.sidebar_settings_api_tokens()} subtitle={m.tokens_subtitle()}>
    <Button href={resolve('settings/api-tokens/new')}><Plus />{m.tokens_generate()}</Button>
    <Button variant="outline" onclick={refresh}><RotateCcw />{m.common_refresh()}</Button>
  </PageHeader>
  <Card.Content class="flex w-full flex-col space-y-4">
    <svelte:boundary onerror={(error: unknown) => handleApiError(error)}>
      {await initialLoad}
      {#if tokens.length === 0}
        <EmptyState
          icon={KeyRound}
          title={m.tokens_empty_title()}
          description={m.tokens_empty_desc()}
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
                  {m.tokens_created_on({
                    date: token.createdOn.toLocaleString(intlLocale(), { dateStyle: 'short' }),
                  })}
                </span>
                <span
                  >{lastUsed ? m.tokens_last_used({ time: lastUsed }) : m.common_never_used()}</span
                >
                <span
                  >{expires ? m.common_expires({ time: expires }) : m.tokens_never_expires()}</span
                >
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
        <PageError
          message={m.tokens_load_failed()}
          onRetry={() => {
            initialLoad = loadTokens();
            reset();
          }}
        />
      {/snippet}
    </svelte:boundary>
  </Card.Content>
</Container>

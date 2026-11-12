<script lang="ts">
  import { m } from '#lib/paraglide/messages.js';
  import {
    type OAuthConnectionResponse,
    authenticatedAccountListOAuthConnections,
  } from '#lib/api/index.js';
  import Link2 from '@lucide/svelte/icons/link-2';
  import Plus from '@lucide/svelte/icons/plus';
  import RotateCcw from '@lucide/svelte/icons/rotate-ccw';
  import Unlink from '@lucide/svelte/icons/unlink';
  import { page } from '$app/state';
  import { GetOAuthAuthorizeUrl } from '#lib/api/next/oauth.js';
  import { Container, EmptyState, PageError, PageHeader } from '@openshock/svelte-core/components';
  import { Button } from '@openshock/svelte-core/components/ui/button';
  import * as Card from '@openshock/svelte-core/components/ui/card';
  import * as Dropdown from '@openshock/svelte-core/components/ui/dropdown-menu';
  import * as Separator from '@openshock/svelte-core/components/ui/separator';
  import { handleApiError } from '#lib/errorhandling/apiErrorHandling.js';
  import { onMount } from 'svelte';
  import { toast } from 'svelte-sonner';
  import DisconnectDialog from './dialog-oauth-disconnect.svelte';
  import { registerBreadcrumbs } from '#lib/state/breadcrumbs-state.svelte.js';
  import { backendMetadata } from '#lib/state/backend-metadata-state.svelte.js';

  registerBreadcrumbs(() => [
    { label: m.sidebar_group_settings(), href: 'settings/account' },
    { label: m.sidebar_settings_connections() },
  ]);

  // ---------- state
  let connections = $state<OAuthConnectionResponse[]>([]);
  // Awaited inside the boundary below so its pending and failed snippets cover the initial load.
  let initialLoad = $state(loadConnections());

  async function loadConnections() {
    connections = await authenticatedAccountListOAuthConnections();
  }
  let refreshing = $state(false);

  // From redirect (?status=)
  let queryStatus = $derived(page.url.searchParams.get('status'));

  // Disconnect dialog
  let disconnectDialog = $state<{ open: boolean; providerKey?: string; displayName?: string }>({
    open: false,
  });

  // ---------- effects
  onMount(() => {
    if (queryStatus) {
      const status = String(queryStatus).toLowerCase();
      if (status === 'ok' || status === 'linked' || status === 'success')
        toast.success(m.connections_toast_linked());
      else if (status === 'cancelled') toast.message(m.connections_toast_cancelled());
      else toast.error(m.connections_toast_failed());
    }
  });

  // ---------- helpers
  async function refresh() {
    refreshing = true;
    try {
      connections = await authenticatedAccountListOAuthConnections();
    } catch (err) {
      await handleApiError(err);
    } finally {
      refreshing = false;
    }
  }

  function isConnected(key: string) {
    return connections.some((c) => c.providerKey === key);
  }

  function displayFor(key: string) {
    return connections.find((c) => c.providerKey === key)?.displayName ?? null;
  }

  // Open confirm dialog for disconnect
  function confirmDisconnect(providerKey: string) {
    const existing = connections.find((c) => c.providerKey === providerKey);
    disconnectDialog = {
      open: true,
      providerKey,
      displayName: existing?.displayName ?? providerKey,
    };
  }

  // Called by dialog on success
  function handleDisconnected(providerKey: string) {
    connections = connections.filter((c) => c.providerKey !== providerKey);
    toast.success(m.connections_toast_removed());
  }
</script>

<Container>
  <PageHeader title={m.connections_title()} subtitle={m.connections_subtitle()}>
    <Button variant="outline" onclick={refresh} disabled={refreshing} aria-busy={refreshing}>
      <RotateCcw class="size-4" />
      {refreshing ? m.connections_refreshing() : m.common_refresh()}
    </Button>
  </PageHeader>

  <Card.Content class="flex w-full flex-1 flex-col space-y-6">
    <svelte:boundary onerror={(error: unknown) => handleApiError(error)}>
      {await initialLoad}
      <!-- Quick actions -->
      <div class="flex flex-wrap gap-2">
        <Dropdown.Root>
          <Dropdown.Trigger>
            {#snippet child({ props })}
              <Button {...props} variant="secondary">
                <Plus class="mr-2 size-4" />
                {m.connections_link_new()}
              </Button>
            {/snippet}
          </Dropdown.Trigger>
          <Dropdown.Content>
            {#each backendMetadata.state!.oAuthProviders as provider (provider)}
              {#if !isConnected(provider)}
                <Dropdown.Item>
                  <Link2 class="mr-2 size-4" />
                  <form action={GetOAuthAuthorizeUrl(provider, 'Link')} method="POST">
                    <button type="submit" class="w-full text-left">
                      {provider}
                    </button>
                  </form>
                </Dropdown.Item>
              {/if}
            {/each}
          </Dropdown.Content>
        </Dropdown.Root>
      </div>

      <Separator.Root />

      <!-- Connected list -->
      {#if connections.length === 0}
        <EmptyState
          icon={Link2}
          title={m.connections_empty_title()}
          description={m.connections_empty_desc()}
        />
      {:else}
        <div class="grid gap-3 md:grid-cols-2">
          {#each backendMetadata.state!.oAuthProviders as p (p)}
            {#if isConnected(p)}
              <div class="flex items-center justify-between rounded-xl border p-4">
                <div class="min-w-0">
                  <div class="truncate text-base font-medium">{p}</div>
                  <div class="text-muted-foreground truncate text-sm">
                    {displayFor(p) ?? p}
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    onclick={() => confirmDisconnect(p)}
                    class="text-destructive hover:text-destructive"
                  >
                    <Unlink class="mr-2 size-4" />
                    {m.connections_unlink()}
                  </Button>
                </div>
              </div>
            {/if}
          {/each}
        </div>
      {/if}

      {#snippet pending()}
        <div class="grid gap-3 md:grid-cols-2">
          {#each Array(4)}
            <div class="animate-pulse rounded-xl border p-4">
              <div class="bg-muted-foreground/15 mb-2 h-5 w-40 rounded"></div>
              <div class="bg-muted-foreground/10 h-4 w-64 rounded"></div>
            </div>
          {/each}
        </div>
      {/snippet}

      {#snippet failed(_error: unknown, reset: () => void)}
        <PageError
          message={m.connections_load_failed()}
          onRetry={() => {
            initialLoad = loadConnections();
            reset();
          }}
        />
      {/snippet}
    </svelte:boundary>
  </Card.Content>
</Container>

<!-- Confirm dialog lives once at root -->
<DisconnectDialog
  bind:open={disconnectDialog.open}
  providerKey={disconnectDialog.providerKey}
  displayName={disconnectDialog.displayName}
  onDisconnected={handleDisconnected}
/>

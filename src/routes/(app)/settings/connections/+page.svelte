<script lang="ts">
  import { authenticatedAccountListOAuthConnections } from '$lib/api';
  import Link2 from '@lucide/svelte/icons/link-2';
  import Plus from '@lucide/svelte/icons/plus';
  import RotateCcw from '@lucide/svelte/icons/rotate-ccw';
  import Unlink from '@lucide/svelte/icons/unlink';
  import { page } from '$app/state';
  import { GetOAuthAuthorizeUrl } from '$lib/api/next/oauth';
  import { Container } from '@openshock/svelte-core/components';
  import { Button } from '@openshock/svelte-core/components/ui/button';
  import * as Card from '@openshock/svelte-core/components/ui/card';
  import { EmptyState } from '@openshock/svelte-core/components';
  import * as Dropdown from '@openshock/svelte-core/components/ui/dropdown-menu';
  import * as Separator from '@openshock/svelte-core/components/ui/separator';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
  import { onMount } from 'svelte';
  import { toast } from 'svelte-sonner';
  import DisconnectDialog from './dialog-oauth-disconnect.svelte';
  import { registerBreadcrumbs } from '$lib/state/breadcrumbs-state.svelte';
  import { backendMetadata } from '$lib/state/backend-metadata-state.svelte';

  registerBreadcrumbs(() => [
    { label: 'Settings', href: '/settings/account' },
    { label: 'Connections' },
  ]);

  // ---------- state
  let connections = $derived(await authenticatedAccountListOAuthConnections());
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
      const m = String(queryStatus).toLowerCase();
      if (m === 'ok' || m === 'linked' || m === 'success') toast.success('Account linked.');
      else if (m === 'cancelled') toast.message('Link flow cancelled.');
      else toast.error('Linking failed.');
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
    toast.success('Connection removed');
  }
</script>

<Container>
  <Card.Header class="w-full">
    <Card.Title class="flex items-center justify-between text-3xl">
      OAuth Connections
      <div class="flex items-center gap-2">
        <Button variant="ghost" onclick={refresh} disabled={refreshing} aria-busy={refreshing}>
          <RotateCcw class="mr-2 size-4" />
          {refreshing ? 'Refreshing…' : 'Refresh'}
        </Button>
      </div>
    </Card.Title>
    <Card.Description>
      Link or unlink third-party accounts to sign in faster and keep your profile in sync.
    </Card.Description>
  </Card.Header>

  <Card.Content class="flex w-full flex-1 flex-col space-y-6">
    <svelte:boundary onerror={(error) => handleApiError(error)}>
      <!-- Quick actions -->
      <div class="flex flex-wrap gap-2">
        <Dropdown.Root>
          <Dropdown.Trigger>
            {#snippet child({ props })}
              <Button {...props} variant="secondary" data-tour="connections-link">
                <Plus class="mr-2 size-4" />
                Link new provider
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
          title="No connections yet"
          description="Choose “Link new provider” above to connect available providers."
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
                    class="text-red-600 hover:text-red-700"
                  >
                    <Unlink class="mr-2 size-4" />
                    Unlink
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
              <div class="mb-2 h-5 w-40 rounded bg-black/10"></div>
              <div class="h-4 w-64 rounded bg-black/5"></div>
            </div>
          {/each}
        </div>
      {/snippet}

      {#snippet failed(_error, reset)}
        <div class="flex w-full flex-col items-center gap-3 py-12">
          <p class="text-destructive text-sm">Failed to load OAuth connections.</p>
          <Button variant="outline" onclick={reset}>Try again</Button>
        </div>
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

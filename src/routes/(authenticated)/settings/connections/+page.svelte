<script lang="ts">
  import Link2 from '@lucide/svelte/icons/link-2';
  import Plus from '@lucide/svelte/icons/plus';
  import RotateCcw from '@lucide/svelte/icons/rotate-ccw';
  import Unlink from '@lucide/svelte/icons/unlink';
  import { page } from '$app/state';
  import { accountV1Api } from '$lib/api';
  import type { OAuthConnectionResponse } from '$lib/api/internal/v1/models';
  import Container from '$lib/components/Container.svelte';
  import { Button } from '$lib/components/ui/button';
  import * as Card from '$lib/components/ui/card';
  import * as Dropdown from '$lib/components/ui/dropdown-menu';
  import * as Separator from '$lib/components/ui/separator';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
  import { onMount } from 'svelte';
  import { toast } from 'svelte-sonner';
  import DisconnectDialog from './dialog-oauth-disconnect.svelte';

  // ---------- state
  let loading = $state(false); // overall refresh button state
  let loadingProviders = $state(true);
  let loadingConnections = $state(true);

  // From redirect (?status=)
  let queryStatus = $derived(page.url.searchParams.get('status'));

  // Data
  let providers = $state<string[]>(JSON.parse(sessionStorage.getItem('oAuthProviders') ?? '[]'));
  let connections = $state<OAuthConnectionResponse[]>([]);

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
    // Load both providers and current connections
    void refresh();
  });

  // ---------- helpers
  async function refresh() {
    loading = true;
    // Load in parallel, but keep individual spinners meaningful
    loadingProviders = true;
    loadingConnections = true;

    try {
      connections = await accountV1Api.authenticatedAccountListOAuthConnections();
    } catch (err) {
      await handleApiError(err);
    } finally {
      loadingProviders = false;
      loadingConnections = false;
      loading = false;
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
        <Button variant="ghost" onclick={refresh} disabled={loading} aria-busy={loading}>
          <RotateCcw class="mr-2 size-4" />
          {loading ? 'Refreshing…' : 'Refresh'}
        </Button>
      </div>
    </Card.Title>
    <Card.Description>
      Link or unlink third-party accounts to sign in faster and keep your profile in sync.
    </Card.Description>
  </Card.Header>

  <Card.Content class="space-y-6">
    <!-- Quick actions -->
    <div class="flex flex-wrap gap-2">
      <Dropdown.Root>
        <Dropdown.Trigger>
          {#snippet child({ props })}
            <Button {...props} variant="secondary" disabled={loadingProviders}>
              <Plus class="mr-2 size-4" />
              {loadingProviders ? 'Loading providers…' : 'Link new provider'}
            </Button>
          {/snippet}
        </Dropdown.Trigger>
        <Dropdown.Content>
          {#if loadingProviders}
            <Dropdown.Item disabled>Loading…</Dropdown.Item>
          {:else}
            {#each providers as p}
              {#if !isConnected(p)}
                <Dropdown.Item>
                  <Link2 class="mr-2 size-4" /> <!-- TODO: Form + button [POST] -->
                </Dropdown.Item>
              {/if}
            {/each}
          {/if}
        </Dropdown.Content>
      </Dropdown.Root>
    </div>

    <Separator.Root />

    <!-- Connected list -->
    {#if loadingConnections}
      <div class="grid gap-3 md:grid-cols-2">
        {#each Array(4) as _}
          <div class="animate-pulse rounded-xl border p-4">
            <div class="mb-2 h-5 w-40 rounded bg-black/10"></div>
            <div class="h-4 w-64 rounded bg-black/5"></div>
          </div>
        {/each}
      </div>
    {:else if connections.length === 0}
      <div class="rounded-xl border p-6 text-sm">
        <div class="mb-2 font-medium">No connections yet</div>
        <div class="text-muted-foreground">
          Choose “Link new provider” above to connect available providers.
        </div>
      </div>
    {:else}
      <div class="grid gap-3 md:grid-cols-2">
        {#each providers as p}
          {#if isConnected(p)}
            <div class="flex items-center justify-between rounded-xl border p-4">
              <div class="min-w-0">
                <div class="truncate text-base font-medium">{p}</div>
                <div class="truncate text-sm text-muted-foreground">
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
  </Card.Content>
</Container>

<!-- Confirm dialog lives once at root -->
<DisconnectDialog
  bind:open={disconnectDialog.open}
  providerKey={disconnectDialog.providerKey}
  displayName={disconnectDialog.displayName}
  onDisconnected={handleDisconnected}
/>

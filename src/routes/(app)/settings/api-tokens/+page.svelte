<script lang="ts">
  import Plus from '@lucide/svelte/icons/plus';
  import RotateCcw from '@lucide/svelte/icons/rotate-ccw';
  import type { SortingState } from '@tanstack/table-core';
  import type { ColumnDef } from '@tanstack/table-core';
  import { apiTokensApi } from '$lib/api';
  import type { TokenCreatedResponse, TokenResponse } from '$lib/api/internal/v1';
  import Container from '$lib/components/Container.svelte';
  import {
    CreateActionsColumnDef,
    CreateSortableColumnDef,
    LocaleDateRenderer,
    RenderCell,
    TimeSinceRelativeOrNeverRenderer,
  } from '$lib/components/Table/ColumnUtils';
  import DataTable from '$lib/components/Table/DataTableTemplate.svelte';
  import Button from '$lib/components/ui/button/button.svelte';
  import * as Card from '$lib/components/ui/card';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
  import { onMount } from 'svelte';
  import { toast } from 'svelte-sonner';
  import DataTableActions from './data-table-actions.svelte';
  import TokenCreateDialog from './dialog-token-create.svelte';
  import { registerBreadcrumbs } from '$lib/state/breadcrumbs-state.svelte';
  import TokenCreatedDialog from './dialog-token-created.svelte';

  registerBreadcrumbs(() => [
    { label: 'Settings', href: '/settings/account' },
    { label: 'API Tokens' },
  ]);

  let tokens = $state<TokenResponse[]>([]);
  let sorting = $state<SortingState>([]);

  async function loadTokens() {
    try {
      tokens = await apiTokensApi.tokensListTokens();
    } catch (error) {
      await handleApiError(error);
    }
  }

  onMount(loadTokens);

  function onCreated(token: TokenCreatedResponse) {
    tokens.push({
      id: token.id,
      name: token.name,
      createdOn: token.createdAt,
      validUntil: token.validUntil,
      lastUsed: token.lastUsed,
      permissions: token.permissions,
    });
    createdTokenSecret = token.token;
    toast.success('Token created successfully');
  }

  function onEdit(id: string, updater: (token: TokenResponse) => TokenResponse) {
    const idx = tokens.findIndex((t) => t.id === id);
    if (idx !== -1) tokens[idx] = updater(tokens[idx]);
  }

  function onDeleted(id: string) {
    tokens = tokens.filter((t) => t.id !== id);
  }

  const columns: ColumnDef<TokenResponse>[] = [
    CreateSortableColumnDef('name', 'Name', RenderCell),
    CreateSortableColumnDef('createdOn', 'Created at', LocaleDateRenderer),
    CreateSortableColumnDef('validUntil', 'Expires at', TimeSinceRelativeOrNeverRenderer),
    CreateSortableColumnDef('lastUsed', 'Last used', TimeSinceRelativeOrNeverRenderer),
    CreateActionsColumnDef(DataTableActions, (token) => ({ token, onEdit, onDeleted })),
  ];

  let showGenerateTokenModal = $state<boolean>(false);
  let createdTokenSecret = $state<string | null>(null);

  async function refresh() {
    await loadTokens();
    toast.success('Tokens refreshed successfully');
  }
</script>

<TokenCreateDialog bind:open={showGenerateTokenModal} {onCreated} />
<TokenCreatedDialog bind:token={createdTokenSecret} />

<Container>
  <Card.Header class="w-full">
    <Card.Title class="flex items-center justify-between space-x-2 text-3xl">
      API Tokens
      <div>
        <Button onclick={() => (showGenerateTokenModal = true)}>
          <Plus />
          Generate Token
        </Button>
        <Button onclick={refresh}>
          <RotateCcw />
          Refresh
        </Button>
      </div>
    </Card.Title>
    <Card.Description>API Tokens are used to authenticate with the OpenShock API</Card.Description>
  </Card.Header>
  <Card.Content class="flex w-full flex-col space-y-4">
    <DataTable data={tokens} {columns} {sorting} />
  </Card.Content>
</Container>

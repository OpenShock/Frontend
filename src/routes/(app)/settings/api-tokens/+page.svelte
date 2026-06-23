<script lang="ts">
  import { tokensListTokensV2 } from '$lib/api';
  import type { TokenResponseV2 } from '$lib/api';
  import { resolve } from '$app/paths';
  import Plus from '@lucide/svelte/icons/plus';
  import RotateCcw from '@lucide/svelte/icons/rotate-ccw';
  import type { SortingState } from '@tanstack/table-core';
  import type { ColumnDef } from '@tanstack/table-core';
  import Container from '$lib/components/Container.svelte';
  import {
    CreateActionsColumnDef,
    CreateColumnDef,
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
  import { registerBreadcrumbs } from '$lib/state/breadcrumbs-state.svelte';

  registerBreadcrumbs(() => [
    { label: 'Settings', href: '/settings/account' },
    { label: 'API Tokens' },
  ]);

  let tokens = $state<TokenResponseV2[]>([]);
  let sorting = $state<SortingState>([]);

  async function loadTokens(): Promise<boolean> {
    try {
      tokens = await tokensListTokensV2();
      return true;
    } catch (error) {
      await handleApiError(error);
      return false;
    }
  }

  function onEdit(id: string, updater: (token: TokenResponseV2) => TokenResponseV2) {
    tokens = tokens.map((t) => (t.id === id ? updater(t) : t));
  }

  function onDeleted(id: string) {
    tokens = tokens.filter((t) => t.id !== id);
  }

  const columns: ColumnDef<TokenResponseV2>[] = [
    CreateSortableColumnDef('name', 'Name', RenderCell),
    CreateColumnDef('shockerControl', 'Status', (sc) =>
      sc.paused
        ? { text: 'Paused', bold: true, color: 'orange' }
        : { text: 'Active', bold: true, color: 'green' }
    ),
    CreateSortableColumnDef('createdOn', 'Created at', LocaleDateRenderer),
    CreateSortableColumnDef('validUntil', 'Expires at', TimeSinceRelativeOrNeverRenderer),
    CreateSortableColumnDef('lastUsed', 'Last used', TimeSinceRelativeOrNeverRenderer),
    CreateActionsColumnDef(DataTableActions, (token) => ({ token, onEdit, onDeleted })),
  ];

  async function refresh() {
    if (await loadTokens()) {
      toast.success('Tokens refreshed successfully');
    }
  }

  onMount(loadTokens);
</script>

<Container>
  <Card.Header class="w-full">
    <Card.Title class="flex items-center justify-between space-x-2 text-3xl">
      API Tokens
      <div>
        <Button href={resolve('/settings/api-tokens/new')}>
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

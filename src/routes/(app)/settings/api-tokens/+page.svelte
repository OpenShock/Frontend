<script lang="ts">
  import { tokensListTokensV2 } from '$lib/api';
  import type { TokenResponseV2 } from '$lib/api';
  import { resolve } from '$app/paths';
  import Plus from '@lucide/svelte/icons/plus';
  import RotateCcw from '@lucide/svelte/icons/rotate-ccw';
  import type { SortingState } from '@tanstack/table-core';
  import type { ColumnDef } from '@tanstack/table-core';
  import { Container } from '@openshock/svelte-core/components';
  import { Spinner } from '@openshock/svelte-core/components/ui/spinner';
  import {
    CreateActionsColumnDef,
    CreateColumnDef,
    CreateSortableColumnDef,
    LocaleDateRenderer,
    RenderCell,
    TimeSinceRelativeOrNeverRenderer,
  } from '$lib/components/Table/ColumnUtils';
  import DataTable from '$lib/components/Table/DataTableTemplate.svelte';
  import { Button } from '@openshock/svelte-core/components/ui/button';
  import * as Card from '@openshock/svelte-core/components/ui/card';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
  import { toast } from 'svelte-sonner';
  import DataTableActions from './data-table-actions.svelte';
  import { registerBreadcrumbs } from '$lib/state/breadcrumbs-state.svelte';

  registerBreadcrumbs(() => [
    { label: 'Settings', href: '/settings/account' },
    { label: 'API Tokens' },
  ]);

  let tokens = $derived(await tokensListTokensV2());
  let sorting = $state<SortingState>([]);

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
    try {
      tokens = await tokensListTokensV2();
      toast.success('Tokens refreshed successfully');
    } catch (error) {
      await handleApiError(error);
    }
  }
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
    <svelte:boundary onerror={(error: unknown) => handleApiError(error)}>
      <DataTable data={tokens} {columns} {sorting} />

      {#snippet pending()}
        <div class="flex h-64 w-full items-center justify-center">
          <Spinner class="size-8 text-gray-600 dark:text-gray-300" />
        </div>
      {/snippet}

      {#snippet failed(_error: unknown, reset: () => void)}
        <div class="flex w-full flex-col items-center gap-3 py-12">
          <p class="text-destructive text-sm">Failed to load API tokens.</p>
          <Button variant="outline" onclick={reset}>Try again</Button>
        </div>
      {/snippet}
    </svelte:boundary>
  </Card.Content>
</Container>

<script lang="ts">
  import Plus from '@lucide/svelte/icons/plus';
  import RotateCcw from '@lucide/svelte/icons/rotate-ccw';
  import type { SortingState } from '@tanstack/table-core';
  import type { ColumnDef } from '@tanstack/table-core';
  import { apiTokensApi } from '$lib/api';
  import type { TokenCreatedResponse, TokenResponse } from '$lib/api/internal/v1';
  import Container from '$lib/components/Container.svelte';
  import {
    CreateSortableColumnDef,
    LocaleDateRenderer,
    RenderCell,
    TimeSinceRelativeOrNeverRenderer,
  } from '$lib/components/Table/ColumnUtils';
  import DataTable from '$lib/components/Table/DataTableTemplate.svelte';
  import Button from '$lib/components/ui/button/button.svelte';
  import * as Card from '$lib/components/ui/card';
  import { renderComponent } from '$lib/components/ui/data-table';
  import type { ProblemDetails } from '$lib/errorhandling/ProblemDetails';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
  import { onMount } from 'svelte';
  import { toast } from 'svelte-sonner';
  import DataTableActions from './data-table-actions.svelte';
  import TokenCreateDialog from './dialog-token-create.svelte';
  import TokenCreatedDialog from './dialog-token-created.svelte';

  let loading = $state<boolean>(false);
  let data = $state<TokenResponse[]>([]);
  let sorting = $state<SortingState>([]);

  function onCreated(token: TokenCreatedResponse) {
    data.push({
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
    const idx = data.findIndex((token) => token.id === id);
    if (idx === -1) return;

    data[idx] = updater(data[idx]);
  }

  async function onDeleted(id: string) {
    const idx = data.findIndex((token) => token.id === id);
    if (idx === -1) return;

    data.splice(idx, 1);
  }

  const columns: ColumnDef<TokenResponse>[] = [
    CreateSortableColumnDef('name', 'Name', RenderCell),
    CreateSortableColumnDef('createdOn', 'Created at', LocaleDateRenderer),
    CreateSortableColumnDef('validUntil', 'Expires at', TimeSinceRelativeOrNeverRenderer),
    CreateSortableColumnDef('lastUsed', 'Last used', TimeSinceRelativeOrNeverRenderer),
    {
      id: 'actions',
      cell: ({ row }) => {
        // You can pass whatever you need from `row.original` to the component
        return renderComponent(DataTableActions, { token: row.original, onEdit, onDeleted });
      },
    },
  ];

  let showGenerateTokenModal = $state<boolean>(false);
  let createdTokenSecret = $state<string | null>(null);

  function handleProblem(problem: ProblemDetails): boolean {
    return false;
  }

  async function loadTokens(successMessage?: string) {
    loading = true;
    try {
      data = await apiTokensApi.tokensListTokens();
      if (successMessage) {
        toast.success(successMessage);
      }
    } catch (error) {
      await handleApiError(error, handleProblem);
    } finally {
      loading = false;
    }
  }

  onMount(loadTokens);
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
        <Button onclick={() => loadTokens('Tokens refreshed successfully')}>
          <RotateCcw />
          Refresh
        </Button>
      </div>
    </Card.Title>
    <Card.Description>API Tokens are used to authenticate with the OpenShock API</Card.Description>
  </Card.Header>
  <Card.Content class="flex flex-col space-y-4 w-full">
    <DataTable {data} {columns} {sorting} />
  </Card.Content>
</Container>

<script lang="ts">
  import type { SortingState } from '@tanstack/table-core';
  import type { ColumnDef } from '@tanstack/table-core';
  import { adminApi } from '$lib/api';
  import type { ConfigurationItemDto } from '$lib/api/internal/v1';
  import Container from '$lib/components/Container.svelte';
  import {
    CreateSortableColumnDef,
    LocaleDateTimeRenderer,
    RenderCell,
  } from '$lib/components/Table/ColumnUtils';
  import DataTable from '$lib/components/Table/DataTableTemplate.svelte';
  import { Button } from '$lib/components/ui/button';
  import { CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { renderComponent } from '$lib/components/ui/data-table';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
  import { onMount } from 'svelte';
  import DataTableActions from './data-table-actions.svelte';
  import WebhookAddDialog from './dialog-item-add.svelte';

  const columns: ColumnDef<ConfigurationItemDto>[] = [
    CreateSortableColumnDef('name', 'Name', RenderCell),
    CreateSortableColumnDef('description', 'Description', RenderCell),
    CreateSortableColumnDef('type', 'Type', RenderCell),
    CreateSortableColumnDef('value', 'Value', RenderCell),
    CreateSortableColumnDef('updatedAt', 'Updated at', LocaleDateTimeRenderer),
    CreateSortableColumnDef('createdAt', 'Created at', LocaleDateTimeRenderer),
    {
      id: 'actions',
      cell: ({ row }) => {
        // You can pass whatever you need from `row.original` to the component
        return renderComponent(DataTableActions, { item: row.original, onChange: fetchWebhooks });
      },
    },
  ];

  let data = $state<ConfigurationItemDto[]>([]);
  let sorting = $state<SortingState>([]);

  let addDialogOpen = $state<boolean>(false);

  function fetchWebhooks() {
    adminApi
      .adminConfigurationList()
      .then((res) => {
        data = res;
      })
      .catch(handleApiError);
  }

  onMount(fetchWebhooks);
</script>

<WebhookAddDialog bind:open={addDialogOpen} onAdded={fetchWebhooks} />

<Container>
  <CardHeader class="w-full">
    <CardTitle class="flex items-center justify-between space-x-2 text-3xl">
      Configuration
      <Button onclick={() => (addDialogOpen = true)}>Add new</Button>
    </CardTitle>
  </CardHeader>
  <div class="grid w-full gap-6 p-6">
    <DataTable {data} {columns} {sorting} />
  </div>
</Container>

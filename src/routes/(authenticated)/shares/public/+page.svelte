<script lang="ts">
  import Plus from '@lucide/svelte/icons/plus';
  import RotateCcw from '@lucide/svelte/icons/rotate-ccw';
  import type { SortingState } from '@tanstack/table-core';
  import type { ColumnDef } from '@tanstack/table-core';
  import { publicShockerSharesApi } from '$lib/api';
  import type { OwnPublicShareResponse } from '$lib/api/internal/v1';
  import Container from '$lib/components/Container.svelte';
  import {
    CreateSortableColumnDef,
    LocaleDateTimeRenderer,
    RenderCell,
    TimeSinceRelativeOrNeverRenderer,
  } from '$lib/components/Table/ColumnUtils';
  import DataTable from '$lib/components/Table/DataTableTemplate.svelte';
  import Button from '$lib/components/ui/button/button.svelte';
  import * as Card from '$lib/components/ui/card';
  import { renderComponent } from '$lib/components/ui/data-table';
  import { onMount } from 'svelte';
  import DataTableActions from './data-table-actions.svelte';
  import CreatePublicShareDialog from './dialog-publicshare-create.svelte';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';

  const columns: ColumnDef<OwnPublicShareResponse>[] = [
    CreateSortableColumnDef('name', 'Name', RenderCell),
    CreateSortableColumnDef('createdOn', 'Created at', LocaleDateTimeRenderer),
    CreateSortableColumnDef('expiresOn', 'Expires', TimeSinceRelativeOrNeverRenderer),
    {
      id: 'actions',
      cell: ({ row }) => {
        // You can pass whatever you need from `row.original` to the component
        return renderComponent(DataTableActions, {
          publicShare: row.original,
          onChange: refreshPublicShares,
        });
      },
    },
  ];

  let data = $state<OwnPublicShareResponse[]>([]);
  let sorting = $state<SortingState>([]);

  let showAddShareModal = $state<boolean>(false);

  function refreshPublicShares() {
    publicShockerSharesApi
      .shareLinksList()
      .then((publicShares) => {
        if (publicShares.data === null) {
          console.warn('Failed to get share links, but response was success!');
          return;
        }
        data = publicShares.data;
      })
      .catch(handleApiError);
  }

  onMount(refreshPublicShares);
</script>

<CreatePublicShareDialog bind:open={showAddShareModal} onCreated={refreshPublicShares} />

<Container>
  <Card.Header class="w-full">
    <Card.Title class="flex items-center justify-between space-x-2 text-3xl">
      Public Shares
      <div>
        <Button onclick={() => (showAddShareModal = true)}>
          <Plus />
          Add Share
        </Button>
        <Button onclick={refreshPublicShares}>
          <RotateCcw />
          Refresh
        </Button>
      </div>
    </Card.Title>
    <Card.Description>This is a list of all the public shares you own.</Card.Description>
  </Card.Header>
  <Card.Content class="w-full">
    <DataTable {data} {columns} {sorting} />
  </Card.Content>
</Container>

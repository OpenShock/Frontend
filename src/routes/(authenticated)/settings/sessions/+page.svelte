<script lang="ts">
  import RotateCcw from '@lucide/svelte/icons/rotate-ccw';
  import type { ColumnDef, SortingState } from '@tanstack/table-core';
  import { sessionsApi } from '$lib/api';
  import type { LoginSessionResponse } from '$lib/api/internal/v1';
  import Container from '$lib/components/Container.svelte';
  import {
    CreateColumnDef,
    CreateSortableColumnDef,
    RenderCell,
    TimeSinceRelativeOrNeverRenderer,
    TimeSinceRelativeRenderer,
    UserAgentRenderer,
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

  let loading = $state<boolean>(false);
  let data = $state<LoginSessionResponse[]>([]);
  let sorting = $state<SortingState>([]);

  function onRevoked(sessionId: string) {
    const idx = data.findIndex((session) => session.id === sessionId);
    if (idx === -1) return;

    data.splice(idx, 1);
  }

  const columns: ColumnDef<LoginSessionResponse>[] = [
    CreateColumnDef('ip', 'Ip', RenderCell),
    CreateSortableColumnDef('userAgent', 'User Agent', UserAgentRenderer),
    CreateSortableColumnDef('created', 'Created at', TimeSinceRelativeRenderer),
    CreateSortableColumnDef('expires', 'Expires at', TimeSinceRelativeRenderer),
    CreateSortableColumnDef('lastUsed', 'Last seen', TimeSinceRelativeOrNeverRenderer),
    {
      id: 'actions',
      cell: ({ row }) => {
        // You can pass whatever you need from `row.original` to the component
        return renderComponent(DataTableActions, { session: row.original, onRevoked });
      },
    },
  ];

  function handleProblem(problem: ProblemDetails): boolean {
    return false;
  }

  async function fetchSessions() {
    loading = true;
    try {
      data = await sessionsApi.sessionsListSessions();
    } catch (error) {
      await handleApiError(error, handleProblem);
    } finally {
      loading = false;
    }
  }

  async function onRefreshClicked() {
    await fetchSessions();
    toast.success('Sessions refreshed successfully');
  }

  onMount(() => {
    fetchSessions();

    // Update timestamps every 5 seconds
    const interval = setInterval(() => {
      if (data) {
        data = Object.assign([], data);
      }
    }, 5000);

    return () => clearInterval(interval);
  });
</script>

<Container>
  <Card.Header class="w-full">
    <Card.Title class="flex items-center justify-between space-x-2 text-3xl">
      Sessions
      <Button class="text-xl" onclick={onRefreshClicked}>
        <RotateCcw />
        <span> Refresh </span>
      </Button>
    </Card.Title>
    <Card.Description>
      This is a list of all active sessions of your account. Revoke any sessions you do not
      recognize.
    </Card.Description>
  </Card.Header>
  <Card.Content class="w-full">
    <DataTable {data} {columns} {sorting} />
  </Card.Content>
</Container>

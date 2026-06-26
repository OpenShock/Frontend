<script lang="ts">
  import { sessionsListSessions } from '$lib/api';
  import type { LoginSessionResponse } from '$lib/api';
  import RotateCcw from '@lucide/svelte/icons/rotate-ccw';
  import type { ColumnDef, SortingState } from '@tanstack/table-core';
  import { Container } from '@openshock/svelte-core/components';
  import {
    CreateActionsColumnDef,
    CreateColumnDef,
    CreateSortableColumnDef,
    RenderCell,
    TimeSinceRelativeOrNeverRenderer,
    TimeSinceRelativeRenderer,
    UserAgentRenderer,
  } from '$lib/components/Table/ColumnUtils';
  import DataTable from '$lib/components/Table/DataTableTemplate.svelte';
  import { Button } from '@openshock/svelte-core/ui/button';
  import * as Card from '@openshock/svelte-core/ui/card';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
  import { onMount } from 'svelte';
  import { toast } from 'svelte-sonner';
  import { registerBreadcrumbs } from '$lib/state/breadcrumbs-state.svelte';
  import DataTableActions from './data-table-actions.svelte';

  registerBreadcrumbs(() => [
    { label: 'Settings', href: '/settings/account' },
    { label: 'Sessions' },
  ]);

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
    CreateSortableColumnDef('created', 'Created', TimeSinceRelativeRenderer),
    CreateSortableColumnDef('expires', 'Expires', TimeSinceRelativeRenderer),
    CreateSortableColumnDef('lastUsed', 'Last seen', TimeSinceRelativeOrNeverRenderer),
    CreateActionsColumnDef(DataTableActions, (session) => ({ session, onRevoked })),
  ];

  async function fetchSessions() {
    try {
      data = await sessionsListSessions();
    } catch (error) {
      await handleApiError(error);
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

<script lang="ts">
  import RotateCcw from '@lucide/svelte/icons/rotate-ccw';
  import type { SortingState } from '@tanstack/table-core';
  import { sessionsApi } from '$lib/api';
  import type { LoginSessionResponse } from '$lib/api/internal/v1';
  import Container from '$lib/components/Container.svelte';
  import DataTable from '$lib/components/Table/DataTableTemplate.svelte';
  import Button from '$lib/components/ui/button/button.svelte';
  import * as Card from '$lib/components/ui/card';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
  import { onMount } from 'svelte';
  import { toast } from 'svelte-sonner';
  import { columns } from './columns';

  let data = $state<LoginSessionResponse[]>([]);
  let sorting = $state<SortingState>([]);

  function fetchSessions() {
    sessionsApi
      .sessionsListSessions()
      .then((res) => (data = res))
      .catch(handleApiError);
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
      <Button
        class="text-xl"
        onclick={() => {
          fetchSessions();
          toast.success('Sessions refreshed successfully');
        }}
      >
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

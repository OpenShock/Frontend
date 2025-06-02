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
  import { onDestroy, onMount } from 'svelte';
  import { type Session, columns } from './columns';

  function apiSessionToTableSession(session: LoginSessionResponse): Session {
    return {
      id: session.id,
      ip: session.ip,
      user_agent: session.userAgent,
      created_at: session.created,
      expires_at: session.expires,
      last_seen: session.lastUsed,
    };
  }

  let data = $state<Session[]>([]);
  let sorting = $state<SortingState>([]);

  function fetchSessions() {
    sessionsApi
      .sessionsListSessions()
      .then((res) => {
        data = res.map(apiSessionToTableSession);
      })
      .catch(handleApiError);
  }

  let interval: ReturnType<typeof setInterval>;
  onMount(() => {
    fetchSessions();
    // Update timestamps every 5 seconds
    interval = setInterval(() => {
      if (data) {
        data = Object.assign([], data);
      }
    }, 5000);
  });
  onDestroy(() => {
    clearInterval(interval);
  });
</script>

<Container>
  <Card.Header>
    <Card.Title class="flex items-center justify-between space-x-2 text-3xl">
      Sessions
      <Button class="text-xl" onclick={fetchSessions}>
        <RotateCcw />
        <span> Refresh </span>
      </Button>
    </Card.Title>
    <Card.Description>
      This is a list of all active sessions of your account. Revoke any sessions you do not
      recognize.
    </Card.Description>
  </Card.Header>
  <Card.Content>
    <DataTable {data} {columns} {sorting} />
  </Card.Content>
</Container>

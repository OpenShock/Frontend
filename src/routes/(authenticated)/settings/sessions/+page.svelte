<script lang="ts">
  import { sessionApi } from '$lib/api';
  import type { LoginSessionResponse} from '$lib/api/internal/v1';
  import * as Dialog from '$lib/components/ui/dialog';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
  import {onDestroy, onMount} from 'svelte';
  import {columns, type Session} from "./columns";
  import DataTable from "./data-table.svelte";

  function apiSessionToTableDevice(session: LoginSessionResponse): Session {
    return {
      id: session.id,
      ip: session.ip,
      user_agent: session.userAgent,
      created_at: session.created,
      expires_at: session.expires
    };
  }

  let sessions = $state<Session[]>([]);
  let sessionToDelete = $state<LoginSessionResponse | null>(null);

  function fetchSessions() {
    sessionApi
      .sessionsListSessions()
      .then((res) => {
        sessions = res.map(apiSessionToTableDevice);
      })
      .catch(handleApiError);
  }

  function deleteSession(sessionId: string) {
    sessionApi
      .sessionsDeleteSession(sessionId)
      .then(() => {
        sessions = sessions.filter((s) => s.id !== sessionId);
      })
      .catch(handleApiError);
  }

  let interval: ReturnType<typeof setInterval>;
  onMount(() => {
    fetchSessions();
    // Trigger refresh every 5 seconds
    interval = setInterval(() => { if (sessions) { sessions = Object.assign([], sessions); } }, 5000);
  });
  onDestroy(() => {
    clearInterval(interval);
  })
</script>

{#if sessionToDelete != null}
  <Dialog.Root>
    <Dialog.Trigger>Open</Dialog.Trigger>
    <Dialog.Content>
      <Dialog.Header>
        <Dialog.Title>Are you sure you want to log out from <b>{sessionToDelete.userAgent}</b>?</Dialog.Title>
        <Dialog.Description>
          !!! Testing text !!!
          This action cannot be undone. This will permanently delete your account
          and remove your data from our servers.
        </Dialog.Description>
      </Dialog.Header>
    </Dialog.Content>
  </Dialog.Root>
{/if}

<div class="flex justify-between w-full mb-2">
  <h2 class="text-3xl">Sessions</h2>
  <button class="btn variant-filled-primary text-xl" onclick={fetchSessions}>
    <i class="fa fa-sync"></i>
    Refresh
  </button>
</div>
<p>Currently valid sessions</p>

{#if sessions}
  <DataTable {sessions} {columns} />
{/if}


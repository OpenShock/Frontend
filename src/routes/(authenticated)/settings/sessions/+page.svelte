<script lang="ts">
  import { sessionApi } from '$lib/api';
  import type { LoginSessionResponse } from '$lib/api/internal/v1';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
  import { getToastStore } from '@skeletonlabs/skeleton';
  import { elapsedToString } from '$lib/utils/time';
  import { escapeHtml } from '$lib/utils/encoding';
  import { getModalStore } from '@skeletonlabs/skeleton';

  const modalStore = getModalStore();

  const toastStore = getToastStore();
  let sessions: LoginSessionResponse[] = $state([]);

  let since: number = $state(Date.now());
  setInterval(() => {
    since = Date.now();
  }, 1000);

  async function listSessions() {
    try {
      sessions = await sessionApi.sessionsListSessions();
      console.log(sessions);
      console.log(typeof sessions[0].expires);
    } catch (e) {
      await handleApiError(e, toastStore);
    }
  }

  async function deleteSession(session: LoginSessionResponse) {
    modalStore.trigger({
      type: 'confirm',
      title: 'Please Confirm',
      body: `Are you sure you want to log out from ${escapeHtml(session.userAgent)}?`,
      response: async (r: boolean) => {
        if (r) await deleteSessionActually(session.id);
      },
    });
  }

  async function deleteSessionActually(sessionId: string) {
    try {
      await sessionApi.sessionsDeleteSession(sessionId);
      sessions = sessions.filter((session) => session.id !== sessionId);
    } catch (e) {
      await handleApiError(e, toastStore);
    }
  }

  listSessions();
</script>

<div class="container h-full mx-auto p-12 flex flex-col justify-start items-start gap-4">
  <h1 class="h1">Sessions</h1>
  <div
    class="w-full flex flex-col items-start gap-y-4 p-4 bg-surface-100-800-token rounded-lg border border-gray-500"
  >
    <p>Currently valid sessions</p>

    <!-- Responsive Container (recommended) -->
    <div class="table-container">
      <!-- Native Table Element -->
      <table class="table table-hover">
        <thead>
          <tr>
            <th>User-Agent</th>
            <th>Created</th>
            <th>Last Seen</th>
            <th>Expires</th>
            <th>IP</th>
            <th class="w-0"></th>
          </tr>
        </thead>
        <tbody>
          {#each sessions as row (row.id)}
            <tr>
              <td>{row.userAgent}</td>
              <td title={row.created.toLocaleString()}>{row.created.toLocaleDateString()}</td>

              <!--
              <td title={row.lastUsed.toLocaleString()}>
                {elapsedToString(since - row.lastUsed.getTime())} ago
              </td>-->
              <td>Not Implemented</td>

              {#if since < row.expires.getTime()}
                <td title={row.expires.toLocaleString()}>
                  {elapsedToString(row.expires.getTime() - since)}
                </td>
              {:else}
                <td title={row.expires.toLocaleString()} class="text-red-500"> Already expired </td>
              {/if}

              <td>{row.ip}</td>

              <td class="!whitespace-nowrap">
                <button
                  class="btn-icon variant-filled-primary fa fa-trash"
                  onclick={() => deleteSession(row)}
                  aria-label="Delete Session"
                ></button>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>
</div>

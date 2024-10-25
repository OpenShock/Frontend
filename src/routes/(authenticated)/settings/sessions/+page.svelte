<script lang="ts">
  import { sessionApi } from '$lib/api';
  import type { LoginSessionResponse } from '$lib/api/internal/v1';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
  import { elapsedToString } from '$lib/utils/time';
  import { escapeHtml } from '$lib/utils/encoding';
  import { getModalStore, getToastStore } from '@skeletonlabs/skeleton';
  import { onMount } from 'svelte';
  import { UAParser } from 'ua-parser-js';

  const modalStore = getModalStore();

  const toastStore = getToastStore();
  let sessions: LoginSessionResponse[] = $state([]);

  function refreshSessions() {
    sessionApi
      .sessionsListSessions()
      .then((s) => {
        sessions = s;
      })
      .catch((e) => {
        handleApiError(e, toastStore);
      });
  }

  function deleteSession(sessionId: string) {
    sessionApi
      .sessionsDeleteSession(sessionId)
      .then(() => {
        sessions = sessions.filter((s) => s.id !== sessionId);
      })
      .catch((e) => {
        handleApiError(e, toastStore);
      });
  }

  function showDeleteSessionModal(session: LoginSessionResponse) {
    modalStore.trigger({
      type: 'confirm',
      title: 'Please Confirm',
      body: `Are you sure you want to log out from <b>${escapeHtml(session.userAgent)}</b>?`,
      response: (r: boolean) => {
        if (r) deleteSession(session.id);
      },
    });
  }

  function getReadableName(userAgent: string | null): string {
    if (!userAgent) return 'Unknown';

    const ua = new UAParser(userAgent);

    const browser = ua.getBrowser();
    const os = ua.getOS();

    return `${browser.name} on ${os.name} ${os.version}`;
  }

  onMount(refreshSessions);

  let since: number = $state(Date.now());
  setInterval(() => {
    since = Date.now();
  }, 1000);
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
            <th>UserAgent</th>
            <th>Created</th>
            <th>Last Seen</th>
            <th>Expires</th>
            <th>IP</th>
            <th class="w-0"></th>
          </tr>
        </thead>
        <tbody>
          {#each sessions as session (session.id)}
            <tr>
              <td title={session.userAgent}>
                {getReadableName(session.userAgent)}
              </td>
              <td title={session.created.toLocaleString()}>
                {session.created.toLocaleDateString()}
              </td>

              <!--
              <td title={row.lastUsed.toLocaleString()}>
                {elapsedToString(since - row.lastUsed.getTime())} ago
              </td>-->
              <td>Not Implemented</td>

              {#if since < session.expires.getTime()}
                <td title={session.expires.toLocaleString()}>
                  {elapsedToString(session.expires.getTime() - since)}
                </td>
              {:else}
                <td title={session.expires.toLocaleString()} class="text-red-500">
                  Already expired
                </td>
              {/if}

              <td>{session.ip}</td>

              <td class="!whitespace-nowrap">
                <button
                  class="btn-icon variant-filled-primary fa fa-trash"
                  onclick={() => showDeleteSessionModal(session)}
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

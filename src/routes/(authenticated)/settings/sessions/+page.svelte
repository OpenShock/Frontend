<script lang="ts">
  import { sessionApi } from '$lib/api';
  import type { LoginSessionResponse } from '$lib/api/internal/v1';
  import * as Dialog from '$lib/components/ui/dialog';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
  import { elapsedToString } from '$lib/utils/time';
  import { onMount } from 'svelte';
  import { UAParser } from 'ua-parser-js';

  let sessions: LoginSessionResponse[] = $state([]);
  let sessionToDelete = $state<LoginSessionResponse | null>(null);

  function refreshSessions() {
    sessionApi
      .sessionsListSessions()
      .then((s) => {
        sessions = s;
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

  function getReadableName(userAgent: string | null): string {
    if (!userAgent) return 'Unknown';

    const ua = new UAParser(userAgent);

    const browser = ua.getBrowser();
    const os = ua.getOS();

    if (!browser.name || !os.name) return userAgent;

    let name = `${browser.name} on ${os.name}`;

    if (os.version) name += ` ${os.version}`;

    return name;
  }

  onMount(refreshSessions);

  let since: number = $state(Date.now());
  setInterval(() => {
    since = Date.now();
  }, 1000);
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
                  onclick={() => sessionToDelete = session}
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

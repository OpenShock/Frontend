<script lang="ts">
  import { sessionsListSessions, sessionsGetSelfSession } from '$lib/api';
  import type { LoginSessionResponse } from '$lib/api';
  import Container from '$lib/components/Container.svelte';
  import PageHeader from '$lib/components/PageHeader.svelte';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
  import { onMount } from 'svelte';
  import { registerBreadcrumbs } from '$lib/state/breadcrumbs-state.svelte';
  import SessionCard from './session-card.svelte';

  registerBreadcrumbs(() => [
    { label: 'Settings', href: '/settings/account' },
    { label: 'Sessions' },
  ]);

  let sessions = $state<LoginSessionResponse[]>([]);
  let currentSessionId = $state<string | null>(null);

  function onRevoked(sessionId: string) {
    const idx = sessions.findIndex((s) => s.id === sessionId);
    if (idx !== -1) sessions.splice(idx, 1);
  }

  // Sort so current session is always first
  const sortedSessions = $derived(
    [...sessions].sort((a, b) => {
      if (a.id === currentSessionId) return -1;
      if (b.id === currentSessionId) return 1;
      return 0;
    })
  );

  async function fetchSessions() {
    try {
      [sessions, { id: currentSessionId }] = await Promise.all([
        sessionsListSessions(),
        sessionsGetSelfSession(),
      ]);
    } catch (error) {
      await handleApiError(error);
    }
  }

  onMount(() => {
    fetchSessions();

    const interval = setInterval(() => {
      if (sessions.length) sessions = [...sessions];
    }, 5000);

    return () => clearInterval(interval);
  });
</script>

<Container>
  <PageHeader
    title="Sessions"
    subtitle="This is a list of all active sessions of your account. Revoke any sessions you do not recognize."
  />

  <div class="flex w-full flex-col gap-3">
    {#each sortedSessions as session (session.id)}
      <SessionCard {session} isCurrent={session.id === currentSessionId} {onRevoked} />
    {/each}
  </div>
</Container>

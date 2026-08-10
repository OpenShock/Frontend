<script lang="ts">
  import { sessionsListSessions } from '$lib/api';
  import type { LoginSessionResponse } from '$lib/api';
  import MonitorSmartphone from '@lucide/svelte/icons/monitor-smartphone';
  import RotateCcw from '@lucide/svelte/icons/rotate-ccw';
  import { Container, EmptyState } from '@openshock/svelte-core/components';
  import { Button } from '@openshock/svelte-core/components/ui/button';
  import * as Card from '@openshock/svelte-core/components/ui/card';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
  import { onMount } from 'svelte';
  import { toast } from 'svelte-sonner';
  import { registerBreadcrumbs } from '$lib/state/breadcrumbs-state.svelte';
  import { getReadableUserAgentName } from '$lib/utils';
  import { formatRelativeInstant, formatRelativeInstantOrNull } from '$lib/utils/datetime';
  import SessionActions from './session-actions.svelte';

  registerBreadcrumbs(() => [
    { label: 'Settings', href: '/settings/account' },
    { label: 'Sessions' },
  ]);

  let data = $state<LoginSessionResponse[]>([]);

  // Re-read on a timer so the relative labels below stay current without
  // refetching. Every label derives from this, so ticking it re-renders them.
  let now = $state(Temporal.Now.instant());

  function onRevoked(sessionId: string) {
    const idx = data.findIndex((session) => session.id === sessionId);
    if (idx === -1) return;

    data.splice(idx, 1);
  }

  function deviceName(userAgent: string | null): string {
    if (!userAgent) return 'Unknown device';
    return getReadableUserAgentName(userAgent) ?? userAgent;
  }

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

    const interval = setInterval(() => (now = Temporal.Now.instant()), 5000);
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
    {#if data.length === 0}
      <EmptyState
        icon={MonitorSmartphone}
        title="No active sessions"
        description="Sessions appear here once you sign in from a browser or app."
      />
    {:else}
      <div class="divide-y rounded-md border">
        {#each data as session (session.id)}
          {@const lastSeen = formatRelativeInstantOrNull(session.lastUsed, now)}
          <div class="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3">
            <div class="flex min-w-0 flex-1 items-center gap-2">
              <span class="truncate font-medium" title={session.userAgent ?? undefined}>
                {deviceName(session.userAgent)}
              </span>
              <span class="text-muted-foreground shrink-0 text-sm">{session.ip}</span>
            </div>
            <div class="text-muted-foreground flex shrink-0 flex-wrap items-center gap-x-4 text-sm">
              <span>{lastSeen ? `Last seen ${lastSeen}` : 'Never used'}</span>
              <span>Signed in {formatRelativeInstant(session.created, now)}</span>
              <span>Expires {formatRelativeInstant(session.expires, now)}</span>
            </div>
            <SessionActions {session} {onRevoked} />
          </div>
        {/each}
      </div>
    {/if}
  </Card.Content>
</Container>

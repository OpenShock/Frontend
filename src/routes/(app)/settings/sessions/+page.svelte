<script lang="ts">
  import { sessionsListSessions } from '$lib/api';
  import type { LoginSessionResponse } from '$lib/api';
  import MonitorSmartphone from '@lucide/svelte/icons/monitor-smartphone';
  import RotateCcw from '@lucide/svelte/icons/rotate-ccw';
  import { Container, EmptyState } from '@openshock/svelte-core/components';
  import { Button } from '@openshock/svelte-core/components/ui/button';
  import * as Card from '@openshock/svelte-core/components/ui/card';
  import { Spinner } from '@openshock/svelte-core/components/ui/spinner';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
  import { onMount } from 'svelte';
  import { toast } from 'svelte-sonner';
  import { registerBreadcrumbs } from '$lib/state/breadcrumbs-state.svelte';
  import { getReadableUserAgentName } from '$lib/utils';
  import { formatRelativeInstant, formatRelativeInstantOrNull } from '$lib/utils/datetime';
  import { createNowTicker } from '@openshock/svelte-core/utils';
  import SessionActions from './session-actions.svelte';

  registerBreadcrumbs(() => [
    { label: 'Settings', href: '/settings/account' },
    { label: 'Sessions' },
  ]);

  let data = $state<LoginSessionResponse[]>([]);
  // Distinguished from "loaded and empty" so the empty state can't stand in for
  // a request that is still running or has failed.
  let loading = $state(true);
  let failed = $state(false);

  const clock = createNowTicker();

  function onRevoked(sessionId: string) {
    const idx = data.findIndex((session) => session.id === sessionId);
    if (idx === -1) return;

    data.splice(idx, 1);
  }

  function deviceName(userAgent: string | null): string {
    if (!userAgent) return 'Unknown device';
    return getReadableUserAgentName(userAgent) ?? userAgent;
  }

  async function fetchSessions(): Promise<boolean> {
    loading = true;
    try {
      data = await sessionsListSessions();
      failed = false;
      return true;
    } catch (error) {
      failed = true;
      await handleApiError(error);
      return false;
    } finally {
      loading = false;
    }
  }

  async function onRefreshClicked() {
    if (await fetchSessions()) {
      toast.success('Sessions refreshed successfully');
    }
  }

  onMount(fetchSessions);
</script>

<Container>
  <Card.Header class="w-full">
    <Card.Title class="flex items-center justify-between space-x-2 text-3xl">
      Sessions
      <Button class="text-xl" onclick={onRefreshClicked} disabled={loading}>
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
    {#if loading && data.length === 0}
      <div class="flex h-64 w-full items-center justify-center">
        <Spinner class="size-8 text-gray-600 dark:text-gray-300" />
      </div>
    {:else if failed && data.length === 0}
      <div class="flex w-full flex-col items-center gap-3 py-12">
        <p class="text-destructive text-sm">Failed to load sessions.</p>
        <Button variant="outline" onclick={fetchSessions} disabled={loading}>Try again</Button>
      </div>
    {:else if data.length === 0}
      <EmptyState
        icon={MonitorSmartphone}
        title="No active sessions"
        description="Sessions appear here once you sign in from a browser or app."
      />
    {:else}
      <div class="divide-y rounded-md border">
        {#each data as session (session.id)}
          {@const lastSeen = formatRelativeInstantOrNull(session.lastUsed, clock.current)}
          <div class="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3">
            <div class="flex min-w-0 flex-1 items-center gap-2">
              <span class="truncate font-medium" title={session.userAgent ?? undefined}>
                {deviceName(session.userAgent)}
              </span>
              <span class="text-muted-foreground shrink-0 text-sm">{session.ip}</span>
            </div>
            <div class="text-muted-foreground flex shrink-0 flex-wrap items-center gap-x-4 text-sm">
              <span>{lastSeen ? `Last seen ${lastSeen}` : 'Never used'}</span>
              <span>Signed in {formatRelativeInstant(session.created, clock.current)}</span>
              <span>Expires {formatRelativeInstant(session.expires, clock.current)}</span>
            </div>
            <SessionActions {session} {onRevoked} />
          </div>
        {/each}
      </div>
    {/if}
  </Card.Content>
</Container>

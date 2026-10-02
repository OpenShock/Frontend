<script lang="ts">
  import { sessionsDeleteSession } from '#lib/api/index.js';
  import type { LoginSessionResponse } from '#lib/api/index.js';
  import { ConfirmDeleteDialog } from '@openshock/svelte-core/components';
  import { handleApiError } from '#lib/errorhandling/apiErrorHandling.js';
  import { getReadableUserAgentName } from '#lib/utils/userAgent.js';
  import { toast } from 'svelte-sonner';

  interface Props {
    open: boolean;
    session: LoginSessionResponse;
    onRevoked: (sessionId: string) => void;
  }

  let { open = $bindable(), session, onRevoked }: Props = $props();

  function handleDeleted() {
    onRevoked(session.id);
    toast.success('Session revoked successfully');
    open = false;
  }

  function revokeSession() {
    sessionsDeleteSession({ path: { sessionId: session.id } })
      .then(handleDeleted)
      .catch(handleApiError);
  }

  let readableUserAgent = $derived(
    getReadableUserAgentName(session.userAgent) ?? session.userAgent
  );
</script>

<ConfirmDeleteDialog
  bind:open
  title="Revoke session"
  actionLabel="Revoke"
  onConfirm={revokeSession}
>
  {#snippet description()}
    Are you sure you want to revoke this session?
  {/snippet}
  <span>
    Session logged in from <strong>{session.ip}</strong> using
    <strong>{readableUserAgent}</strong>
  </span>
</ConfirmDeleteDialog>

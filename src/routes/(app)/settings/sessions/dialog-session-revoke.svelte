<script lang="ts">
  import { sessionsApi } from '$lib/api';
  import type { LoginSessionResponse } from '$lib/api/internal/v1';
  import ConfirmDeleteDialog from '$lib/components/ConfirmDeleteDialog.svelte';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
  import { getReadableUserAgentName } from '$lib/utils/userAgent';
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
    sessionsApi.sessionsDeleteSession(session.id).then(handleDeleted).catch(handleApiError);
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

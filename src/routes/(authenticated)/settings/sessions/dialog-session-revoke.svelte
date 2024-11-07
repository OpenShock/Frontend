<script lang="ts">
  import { sessionApi } from '$lib/api';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
  import * as Dialog from '$lib/components/ui/dialog';
  import Button from '$lib/components/ui/button/button.svelte';
  import type { Session } from './columns';
  import { toast } from 'svelte-sonner';
  import { getReadableUserAgentName } from '$lib/utils/userAgent';

  type Props = {
    open: boolean;
    session: Session;
  };

  let { open = $bindable(), session }: Props = $props();

  function handleDeleted() {
    // TODO: do something
    toast.success('Session revoked successfully');
    open = false;
  }

  function revokeSession() {
    sessionApi.sessionsDeleteSession(session.id).then(handleDeleted).catch(handleApiError);
  }

  let readableUserAgent = $derived(
    getReadableUserAgentName(session.user_agent) ?? session.user_agent
  );
</script>

<Dialog.Root {open} onOpenChange={(o) => (open = o)} controlledOpen={true}>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>Revoke session</Dialog.Title>
      <Dialog.Description>Are you sure you want to revoke this session?</Dialog.Description>
    </Dialog.Header>

    <span>
      Session logged in from <strong>{session.ip}</strong> using
      <strong>{readableUserAgent}</strong>
    </span>

    <Button variant="destructive" onclick={revokeSession}>Delete</Button>
  </Dialog.Content>
</Dialog.Root>

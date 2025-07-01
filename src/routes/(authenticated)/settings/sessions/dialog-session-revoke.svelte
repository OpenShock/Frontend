<script lang="ts">
  import { sessionsApi } from '$lib/api';
  import type { LoginSessionResponse } from '$lib/api/internal/v1';
  import Button from '$lib/components/ui/button/button.svelte';
  import * as Dialog from '$lib/components/ui/dialog';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
  import { getReadableUserAgentName } from '$lib/utils/userAgent';
  import { toast } from 'svelte-sonner';

  interface Props {
    open: boolean;
    session: LoginSessionResponse;
  }

  let { open = $bindable(), session }: Props = $props();

  function handleDeleted() {
    // TODO: do something
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

<Dialog.Root bind:open={() => open, (o) => (open = o)}>
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

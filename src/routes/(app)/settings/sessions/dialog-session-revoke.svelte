<script lang="ts">
  import { m } from '#lib/paraglide/messages.js';
  import { ParaglideMessage } from '@inlang/paraglide-js-svelte';
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

  async function revokeSession() {
    try {
      await sessionsDeleteSession({ path: { sessionId: session.id } });
      toast.success(m.session_toast_revoked());
      onRevoked(session.id);
    } catch (error) {
      await handleApiError(error);
    }
  }

  let readableUserAgent = $derived(
    getReadableUserAgentName(session.userAgent) ?? session.userAgent
  );
</script>

<ConfirmDeleteDialog
  bind:open
  title={m.session_revoke_title()}
  actionLabel={m.session_revoke()}
  onConfirm={revokeSession}
>
  {#snippet description()}
    {m.session_revoke_desc()}
  {/snippet}
  <span>
    <ParaglideMessage
      message={m.session_revoke_from}
      inputs={{ ip: session.ip, agent: readableUserAgent }}
    >
      {#snippet strong({ children })}<strong>{@render children?.()}</strong>{/snippet}
    </ParaglideMessage>
  </span>
</ConfirmDeleteDialog>

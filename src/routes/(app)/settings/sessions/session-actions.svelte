<script lang="ts">
  import { m } from '#lib/paraglide/messages.js';
  import RowActions from '#lib/components/Table/RowActions.svelte';
  import type { LoginSessionResponse } from '#lib/api/index.js';
  import { copyToClipboard } from '@openshock/svelte-core/utils';
  import { Ban, Copy } from '@lucide/svelte';
  import SessionRevokeDialog from './dialog-session-revoke.svelte';

  interface Props {
    session: LoginSessionResponse;
    onRevoked: (sessionId: string) => void;
  }

  let { session, onRevoked }: Props = $props();

  let revokeDialogOpen = $state<boolean>(false);

  const copyId = () => copyToClipboard(session.id, m.common_id_copied());
</script>

<SessionRevokeDialog bind:open={revokeDialogOpen} {session} {onRevoked} />

<RowActions
  actions={[
    { label: m.common_copy_id(), icon: Copy, onclick: copyId },
    {
      label: m.session_revoke(),
      icon: Ban,
      onclick: () => (revokeDialogOpen = true),
      destructive: true,
      separatorBefore: true,
    },
  ]}
/>

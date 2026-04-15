<script lang="ts">
  import type { LoginSessionResponse } from '$lib/api/internal/v1';
  import TableActionMenu from '$lib/components/TableActionMenu.svelte';
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
  import { copyToClipboard } from '$lib/utils/clipboard.svelte';
  import SessionRevokeDialog from './dialog-session-revoke.svelte';

  interface Props {
    session: LoginSessionResponse;
    onRevoked: (sessionId: string) => void;
  }

  let { session, onRevoked }: Props = $props();

  let revokeDialogOpen = $state<boolean>(false);

  const copyId = () => copyToClipboard(session.id, 'ID copied to clipboard');
</script>

<SessionRevokeDialog bind:open={revokeDialogOpen} {session} {onRevoked} />

<TableActionMenu>
  <DropdownMenu.Item onclick={copyId}>Copy ID</DropdownMenu.Item>
  <DropdownMenu.Item onclick={() => (revokeDialogOpen = true)} class="text-red-500">
    Revoke
  </DropdownMenu.Item>
</TableActionMenu>

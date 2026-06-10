<script lang="ts">
  import type { LoginSessionResponse } from '$lib/api';
  import TableActionMenu from '$lib/components/TableActionMenu.svelte';
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
  import { copyToClipboard } from '$lib/utils/clipboard.svelte';
  import { Ban, Copy } from '@lucide/svelte';
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
  <DropdownMenu.Label>Session</DropdownMenu.Label>
  <DropdownMenu.Group>
    <DropdownMenu.Item class="cursor-pointer" onclick={copyId}>
      <Copy class="size-4" />
      Copy ID
    </DropdownMenu.Item>
    <DropdownMenu.Separator />
    <DropdownMenu.Item
      class="cursor-pointer text-red-500"
      onclick={() => (revokeDialogOpen = true)}
    >
      <Ban class="size-4" />
      Revoke
    </DropdownMenu.Item>
  </DropdownMenu.Group>
</TableActionMenu>

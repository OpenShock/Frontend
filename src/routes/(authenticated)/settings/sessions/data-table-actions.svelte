<script lang="ts">
  import Ellipsis from '@lucide/svelte/icons/ellipsis';
  import type { LoginSessionResponse } from '$lib/api/internal/v1';
  import { Button } from '$lib/components/ui/button';
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
  import { toast } from 'svelte-sonner';
  import SessionRevokeDialog from './dialog-session-revoke.svelte';

  interface Props {
    session: LoginSessionResponse;
    onRevoked: (sessionId: string) => void;
  }

  let { session, onRevoked }: Props = $props();

  let revokeDialogOpen = $state<boolean>(false);

  function copyId() {
    navigator.clipboard.writeText(session.id);
    toast.success('ID copied to clipboard');
  }
</script>

<SessionRevokeDialog bind:open={revokeDialogOpen} {session} {onRevoked} />

<DropdownMenu.Root>
  <DropdownMenu.Trigger>
    {#snippet child({ props })}
      <Button {...props} variant="ghost" size="icon" class="relative size-8 p-0">
        <span class="sr-only">Open menu</span>
        <Ellipsis class="size-4" />
      </Button>
    {/snippet}
  </DropdownMenu.Trigger>
  <DropdownMenu.Content>
    <DropdownMenu.Item onclick={copyId}>Copy ID</DropdownMenu.Item>
    <DropdownMenu.Item onclick={() => (revokeDialogOpen = true)} class="text-red-500">
      Revoke
    </DropdownMenu.Item>
  </DropdownMenu.Content>
</DropdownMenu.Root>

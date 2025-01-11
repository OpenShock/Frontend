<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
  import { toast } from 'svelte-sonner';
  import type { ApiToken } from './columns';
  import TokenDeleteDialog from './dialog-token-delete.svelte';
  import TokenEditDialog from './dialog-token-edit.svelte';

  import Ellipsis from 'lucide-svelte/icons/ellipsis';

  type Props = {
    token: ApiToken;
  };

  let { token }: Props = $props();

  let editDialogOpen = $state<boolean>(false);
  let deleteDialogOpen = $state<boolean>(false);

  function copyId() {
    navigator.clipboard.writeText(token.id);
    toast.success('ID copied to clipboard');
  }
</script>

<TokenEditDialog open={editDialogOpen} {token} />
<TokenDeleteDialog open={deleteDialogOpen} {token} />

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
    <DropdownMenu.Item onclick={() => (editDialogOpen = true)}>Edit</DropdownMenu.Item>
    <DropdownMenu.Item onclick={() => (deleteDialogOpen = true)}>Delete</DropdownMenu.Item>
  </DropdownMenu.Content>
</DropdownMenu.Root>

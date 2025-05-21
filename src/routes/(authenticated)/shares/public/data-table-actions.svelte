<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
  import { toast } from 'svelte-sonner';
  import type { OwnPublicShareResponse } from '$lib/api/internal/v1';
  import SharelinkDeleteDialog from './dialog-sharelink-delete.svelte';
  import SharelinkEditDialog from './dialog-sharelink-edit.svelte';

  import Ellipsis from '@lucide/svelte/icons/ellipsis';

  type Props = {
    publicShare: OwnPublicShareResponse;
  };

  let { publicShare }: Props = $props();

  let editDialogOpen = $state<boolean>(false);
  let deleteDialogOpen = $state<boolean>(false);

  function copyId() {
    navigator.clipboard.writeText(publicShare.id);
    toast.success('ID copied to clipboard');
  }
</script>

<SharelinkEditDialog bind:open={editDialogOpen} {publicShare} />
<SharelinkDeleteDialog bind:open={deleteDialogOpen} {publicShare} />

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

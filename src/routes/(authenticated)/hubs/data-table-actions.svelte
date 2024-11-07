<script lang="ts">
  import Ellipsis from 'lucide-svelte/icons/ellipsis';
  import { Button } from '$lib/components/ui/button';
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
  import { toast } from 'svelte-sonner';
  import type { Hub } from './columns';
  import HubUpdateDialog from './dialog-hub-update.svelte';
  import HubEditDialog from './dialog-hub-edit.svelte';
  import HubDeleteDialog from './dialog-hub-delete.svelte';

  type Props = {
    hub: Hub;
  };

  let { hub }: Props = $props();

  let updateDialogOpen = $state<boolean>(false);
  let editDialogOpen = $state<boolean>(false);
  let deleteDialogOpen = $state<boolean>(false);

  function copyId() {
    navigator.clipboard.writeText(hub.id);
    toast.success('ID copied to clipboard');
  }
</script>

<HubUpdateDialog bind:open={updateDialogOpen} {hub} />
<HubEditDialog bind:open={editDialogOpen} {hub} />
<HubDeleteDialog bind:open={deleteDialogOpen} {hub} />

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
    <DropdownMenu.Item onclick={() => (updateDialogOpen = true)}>Update</DropdownMenu.Item>
    <DropdownMenu.Item onclick={() => (editDialogOpen = true)}>Edit</DropdownMenu.Item>
    <DropdownMenu.Item onclick={() => (deleteDialogOpen = true)}>Delete</DropdownMenu.Item>
  </DropdownMenu.Content>
</DropdownMenu.Root>

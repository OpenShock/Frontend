<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
  import { toast } from 'svelte-sonner';
  import type { Hub } from './columns';
  import HubDeleteDialog from './dialog-hub-delete.svelte';
  import HubEditDialog from './dialog-hub-edit.svelte';

  import Ellipsis from '@lucide/svelte/icons/ellipsis';
  import { goto } from '$app/navigation';

  type Props = {
    hub: Hub;
  };

  let { hub }: Props = $props();

  let editDialogOpen = $state<boolean>(false);
  let deleteDialogOpen = $state<boolean>(false);

  function copyId() {
    navigator.clipboard.writeText(hub.id);
    toast.success('ID copied to clipboard');
  }
</script>

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
    <DropdownMenu.Item onclick={() => goto(`/hubs/${hub.id}/update`)}>Update</DropdownMenu.Item>
    <DropdownMenu.Item onclick={() => (editDialogOpen = true)}>Edit</DropdownMenu.Item>
    <DropdownMenu.Item onclick={() => (deleteDialogOpen = true)}>Delete</DropdownMenu.Item>
  </DropdownMenu.Content>
</DropdownMenu.Root>

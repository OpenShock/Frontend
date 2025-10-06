<script lang="ts">
  import Ellipsis from '@lucide/svelte/icons/ellipsis';
  import { goto } from '$app/navigation';
  import { Button } from '$lib/components/ui/button';
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
  import { SignalR_Connection } from '$lib/signalr';
  import { serializeEmergencyStopMessage } from '$lib/signalr/serializers/EmergencyStop';
  import { serializeRebootMessage } from '$lib/signalr/serializers/Reboot';
  import { toast } from 'svelte-sonner';
  import { get } from 'svelte/store';
  import type { Hub } from './columns';
  import HubDeleteDialog from './dialog-hub-delete.svelte';
  import HubEditDialog from './dialog-hub-edit.svelte';
  import PairDialog from './dialog-hub-pair.svelte';
  import RegenerateTokenDialog from './dialog-hub-regenerate-token.svelte';

  interface Props {
    hub: Hub;
  }

  let { hub }: Props = $props();

  let pairDialogOpen = $state<boolean>(false);
  let regenerateTokenDialogOpen = $state<boolean>(false);
  let editDialogOpen = $state<boolean>(false);
  let deleteDialogOpen = $state<boolean>(false);

  function copyId() {
    navigator.clipboard.writeText(hub.id);
    toast.success('ID copied to clipboard');
  }
</script>

<PairDialog bind:open={pairDialogOpen} {hub} />
<RegenerateTokenDialog bind:open={regenerateTokenDialogOpen} {hub} />
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
    <DropdownMenu.Item onclick={() => serializeRebootMessage($SignalR_Connection, hub.id)}>
      Reboot
    </DropdownMenu.Item>
    <DropdownMenu.Item
      class="text-red-500"
      onclick={() => serializeEmergencyStopMessage($SignalR_Connection, hub.id)}
    >
      Emergency Stop
    </DropdownMenu.Item>
    <DropdownMenu.Item onclick={() => (pairDialogOpen = true)}>Pair</DropdownMenu.Item>
    <DropdownMenu.Item onclick={() => (regenerateTokenDialogOpen = true)}>
      Regenerate Token
    </DropdownMenu.Item>
    <DropdownMenu.Item onclick={() => (editDialogOpen = true)}>Edit</DropdownMenu.Item>
    <DropdownMenu.Item onclick={() => (deleteDialogOpen = true)}>Delete</DropdownMenu.Item>
  </DropdownMenu.Content>
</DropdownMenu.Root>

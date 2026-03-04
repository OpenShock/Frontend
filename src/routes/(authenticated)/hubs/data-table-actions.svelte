<script lang="ts">
  import Ellipsis from '@lucide/svelte/icons/ellipsis';
  import { goto } from '$app/navigation';
  import { hubManagementV1Api } from '$lib/api';
  import CopyInput from '$lib/components/CopyInput.svelte';
  import { dialog } from '$lib/components/dialog-manager/dialog-store.svelte';
  import type { DialogRenderProps } from '$lib/components/dialog-manager/types';
  import TextInput from '$lib/components/input/TextInput.svelte';
  import { Badge } from '$lib/components/ui/badge';
  import { Button } from '$lib/components/ui/button';
  import * as Dialog from '$lib/components/ui/dialog';
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
  import { SignalR_Connection } from '$lib/signalr';
  import { serializeCaptivePortalMessage } from '$lib/signalr/serializers/CaptivePortal';
  import { serializeEmergencyStopMessage } from '$lib/signalr/serializers/EmergencyStop';
  import { serializeRebootMessage } from '$lib/signalr/serializers/Reboot';
  import { refreshOwnHubs } from '$lib/stores/HubsStore';
  import { toast } from 'svelte-sonner';
  import type { Hub } from './columns';
  import { resolve } from '$app/paths';

  interface Props {
    hub: Hub;
  }

  let { hub }: Props = $props();

  function copyId() {
    navigator.clipboard.writeText(hub.id);
    toast.success('ID copied to clipboard');
  }

  async function editHub(name: string, close: () => void) {
    try {
      await hubManagementV1Api.devicesEditDevice(hub.id, { name });
      await refreshOwnHubs();
      close();
    } catch (error) {
      handleApiError(error);
    }
  }

  function openEditDialog() {
    dialog.open<{ name: string }>({
      data: { name: hub.name },
      contentSnippet: editSnippet,
    });
  }

  async function openDeleteDialog() {
    const result = await dialog.confirm({
      title: 'Are you sure?',
      confirmButtonText: 'Delete',
      data: hub,
      descSnippet: deleteDescSnippet,
    });
    if (!result.confirmed) return;
    try {
      await hubManagementV1Api.devicesRemoveDevice(hub.id);
      await refreshOwnHubs();
    } catch (error) {
      handleApiError(error);
    }
  }

  async function openPairDialog() {
    await dialog.open<{ loading: boolean; code: string | null }>({
      data: { loading: false, code: null },
      contentSnippet: pairSnippet,
    });
  }

  async function openRegenerateTokenDialog() {
    await dialog.open<{ loading: boolean; token: string | null }>({
      data: { loading: false, token: null },
      contentSnippet: regenerateTokenSnippet,
    });
  }

  async function generatePairCode(
    data: { loading: boolean; code: string | null },
  ) {
    data.loading = true;
    try {
      const resp = await hubManagementV1Api.devicesGetPairCode(hub.id);
      data.code = resp.data;
    } catch (error) {
      handleApiError(error);
    } finally {
      data.loading = false;
    }
  }

  async function regenerateToken(
    data: { loading: boolean; token: string | null },
  ) {
    data.loading = true;
    try {
      data.token = await hubManagementV1Api.devicesRegenerateDeviceToken(hub.id);
    } catch (error) {
      handleApiError(error);
    } finally {
      data.loading = false;
    }
  }
</script>

{#snippet editSnippet(props: DialogRenderProps<{ name: string }>)}
  <Dialog.Header>
    <Dialog.Title>Edit hub</Dialog.Title>
  </Dialog.Header>
  <TextInput label="Name" placeholder={hub.name} bind:value={props.data.name} />
  <Button onclick={() => editHub(props.data.name.trim(), props.close)}>Apply</Button>
{/snippet}

{#snippet deleteDescSnippet(h: Hub)}
  You are about to delete hub "<strong>{h.name}</strong>"<br />
  This will also delete the following shockers:
  <div class="flex justify-center gap-2 pt-2 text-sm sm:justify-start">
    {#each h.shockers as shocker (shocker.id)}
      <Badge>{shocker.name}</Badge>
    {/each}
  </div>
{/snippet}

{#snippet pairSnippet(props: DialogRenderProps<{ loading: boolean; code: string | null }>)}
  <Dialog.Header>
    <Dialog.Title>
      {props.data.loading ? 'Generating...' : props.data.code ? 'Pair code generated' : 'Generate pair code?'}
    </Dialog.Title>
    {#if !props.data.loading}
      <Dialog.Description>
        {#if props.data.code}
          Pair code generated for <strong>{hub.name}</strong><br />
          The code below will not be accessible later, please copy it now and update clients with it
        {:else}
          You are about to generate a pair code for <strong>{hub.name}</strong><br />
          It will be valid for 15 minutes after its creation.<br />
          There is only one active pair code per hub, newly generated ones will override the older active ones.
        {/if}
      </Dialog.Description>
    {/if}
  </Dialog.Header>
  {#if !props.data.loading}
    {#if props.data.code}
      <div>
        <strong class="text-muted-foreground text-sm font-medium">Pair code:</strong>
        <CopyInput value={props.data.code} />
      </div>
      <Button onclick={props.close}>Code has been copied, close</Button>
    {:else}
      <Button onclick={() => generatePairCode(props.data)}>Get Pair Code</Button>
    {/if}
  {/if}
{/snippet}

{#snippet regenerateTokenSnippet(props: DialogRenderProps<{ loading: boolean; token: string | null }>)}
  <Dialog.Header>
    <Dialog.Title>
      {props.data.loading ? 'Generating...' : props.data.token ? 'Token generated' : 'Are you sure?'}
    </Dialog.Title>
    {#if !props.data.loading}
      <Dialog.Description>
        {#if props.data.token}
          New token generated for <strong>{hub.name}</strong><br />
          The code below will not be accessible later, please copy it now and update clients with it
        {:else}
          You are about to regenerate the token for <strong>{hub.name}</strong><br />
          This action will invalidate the current token and disconnect clients using it<br />
          Are you sure you want to do this?
        {/if}
      </Dialog.Description>
    {/if}
  </Dialog.Header>
  {#if !props.data.loading}
    {#if props.data.token}
      <div>
        <strong class="text-muted-foreground text-sm font-medium">New token:</strong>
        <CopyInput value={props.data.token} />
      </div>
      <Button onclick={props.close}>Token has been copied, close</Button>
    {:else}
      <Button onclick={() => regenerateToken(props.data)}>Regenerate Token</Button>
    {/if}
  {/if}
{/snippet}

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
    <DropdownMenu.Item onclick={() => goto(resolve(`/hubs/${hub.id}/update`))}
      >Update</DropdownMenu.Item
    >
    <DropdownMenu.Item onclick={() => serializeRebootMessage($SignalR_Connection, hub.id)}>
      Reboot
    </DropdownMenu.Item>
    <DropdownMenu.Item
      class="text-red-500"
      onclick={() => serializeEmergencyStopMessage($SignalR_Connection, hub.id)}
    >
      Emergency Stop
    </DropdownMenu.Item>
    <DropdownMenu.Item
      onclick={() => serializeCaptivePortalMessage($SignalR_Connection, hub.id, true)}
    >
      Enable Wi-Fi hotspot
    </DropdownMenu.Item>
    <DropdownMenu.Item
      onclick={() => serializeCaptivePortalMessage($SignalR_Connection, hub.id, false)}
    >
      Disable Wi-Fi hotspot
    </DropdownMenu.Item>
    <DropdownMenu.Item onclick={openPairDialog}>Pair</DropdownMenu.Item>
    <DropdownMenu.Item onclick={openRegenerateTokenDialog}>
      Regenerate Token
    </DropdownMenu.Item>
    <DropdownMenu.Item onclick={openEditDialog}>Edit</DropdownMenu.Item>
    <DropdownMenu.Item onclick={openDeleteDialog}>Delete</DropdownMenu.Item>
  </DropdownMenu.Content>
</DropdownMenu.Root>

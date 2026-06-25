<script lang="ts">
  import {
    devicesEditDevice,
    devicesGetPairCode,
    devicesRegenerateDeviceToken,
    devicesRemoveDevice,
  } from '$lib/api';
  import { goto } from '$app/navigation';
  import CopyInput from '$core/components/CopyInput.svelte';
  import { dialog } from '$core/components/dialog-manager/dialog-store.svelte';
  import type { DialogRenderProps } from '$core/components/dialog-manager/types';
  import TextInput from '$core/components/input/TextInput.svelte';
  import TableActionMenu from '$core/components/TableActionMenu.svelte';
  import { Badge } from '$hadcn/badge';
  import { Button } from '$hadcn/button';
  import * as Dialog from '$hadcn/dialog';
  import * as DropdownMenu from '$hadcn/dropdown-menu';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
  import { getConnection } from '$lib/signalr/user.svelte';
  import { serializeCaptivePortalMessage } from '$lib/signalr/serializers/CaptivePortal';
  import { serializeEmergencyStopMessage } from '$lib/signalr/serializers/EmergencyStop';
  import { serializeRebootMessage } from '$lib/signalr/serializers/Reboot';
  import { refreshOwnHubs } from '$lib/state/hubs-state.svelte';
  import { copyToClipboard } from '$core/utils/clipboard.svelte';
  import {
    Copy,
    KeyRound,
    Link,
    OctagonX,
    Pencil,
    RefreshCw,
    RotateCcw,
    Trash2,
    Wifi,
    WifiOff,
  } from '@lucide/svelte';
  import type { Hub } from './columns';
  import { resolve } from '$app/paths';

  interface Props {
    hub: Hub;
  }

  let { hub }: Props = $props();

  const copyId = () => copyToClipboard(hub.id, 'ID copied to clipboard');

  async function editHub(name: string, close: () => void) {
    try {
      await devicesEditDevice({ path: { deviceId: hub.id }, body: { name } });
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
      await devicesRemoveDevice({ path: { deviceId: hub.id } });
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

  async function generatePairCode(data: { loading: boolean; code: string | null }) {
    data.loading = true;
    try {
      const resp = await devicesGetPairCode({ path: { deviceId: hub.id } });
      data.code = resp.data;
    } catch (error) {
      handleApiError(error);
    } finally {
      data.loading = false;
    }
  }

  async function regenerateToken(data: { loading: boolean; token: string | null }) {
    data.loading = true;
    try {
      data.token = await devicesRegenerateDeviceToken({ path: { deviceId: hub.id } });
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
      {props.data.loading
        ? 'Generating...'
        : props.data.code
          ? 'Pair code generated'
          : 'Generate pair code?'}
    </Dialog.Title>
    {#if !props.data.loading}
      <Dialog.Description>
        {#if props.data.code}
          Pair code generated for <strong>{hub.name}</strong><br />
          The code below will not be accessible later, please copy it now and update clients with it
        {:else}
          You are about to generate a pair code for <strong>{hub.name}</strong><br />
          It will be valid for 15 minutes after its creation.<br />
          There is only one active pair code per hub, newly generated ones will override the older active
          ones.
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

{#snippet regenerateTokenSnippet(
  props: DialogRenderProps<{ loading: boolean; token: string | null }>
)}
  <Dialog.Header>
    <Dialog.Title>
      {props.data.loading
        ? 'Generating...'
        : props.data.token
          ? 'Token generated'
          : 'Are you sure?'}
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

<TableActionMenu>
  <DropdownMenu.Label>Hub</DropdownMenu.Label>
  <DropdownMenu.Group>
    <DropdownMenu.Item
      class="cursor-pointer"
      onclick={() => goto(resolve(`/hubs/${hub.id}/update`))}
    >
      <RefreshCw class="size-4" />
      Update
    </DropdownMenu.Item>
    <DropdownMenu.Item
      class="cursor-pointer"
      onclick={() => serializeRebootMessage(getConnection(), hub.id)}
    >
      <RotateCcw class="size-4" />
      Reboot
    </DropdownMenu.Item>
    <DropdownMenu.Item
      class="cursor-pointer"
      onclick={() => serializeCaptivePortalMessage(getConnection(), hub.id, true)}
    >
      <Wifi class="size-4" />
      Enable Wi-Fi hotspot
    </DropdownMenu.Item>
    <DropdownMenu.Item
      class="cursor-pointer"
      onclick={() => serializeCaptivePortalMessage(getConnection(), hub.id, false)}
    >
      <WifiOff class="size-4" />
      Disable Wi-Fi hotspot
    </DropdownMenu.Item>
    <DropdownMenu.Item class="cursor-pointer" onclick={openPairDialog}>
      <Link class="size-4" />
      Pair
    </DropdownMenu.Item>
    <DropdownMenu.Item class="cursor-pointer" onclick={openRegenerateTokenDialog}>
      <KeyRound class="size-4" />
      Regenerate Token
    </DropdownMenu.Item>
    <DropdownMenu.Item class="cursor-pointer" onclick={openEditDialog}>
      <Pencil class="size-4" />
      Edit
    </DropdownMenu.Item>
    <DropdownMenu.Separator />
    <DropdownMenu.Item class="cursor-pointer" onclick={copyId}>
      <Copy class="size-4" />
      Copy ID
    </DropdownMenu.Item>
    <DropdownMenu.Separator />
    <DropdownMenu.Item
      class="cursor-pointer text-red-500"
      onclick={() => serializeEmergencyStopMessage(getConnection(), hub.id)}
    >
      <OctagonX class="size-4" />
      Emergency Stop
    </DropdownMenu.Item>
    <DropdownMenu.Item class="cursor-pointer text-red-500" onclick={openDeleteDialog}>
      <Trash2 class="size-4" />
      Delete
    </DropdownMenu.Item>
  </DropdownMenu.Group>
</TableActionMenu>

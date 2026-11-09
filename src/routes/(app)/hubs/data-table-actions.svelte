<script lang="ts">
  import { m } from '#lib/paraglide/messages.js';
  import { ParaglideMessage } from '@inlang/paraglide-js-svelte';
  import {
    devicesEditDevice,
    devicesGetPairCode,
    devicesRegenerateDeviceToken,
    devicesRemoveDevice,
  } from '#lib/api/index.js';
  import { goto } from '$app/navigation';
  import { CopyInput, TableActionMenu } from '@openshock/svelte-core/components';
  import { dialog, type DialogRenderProps } from '@openshock/svelte-core/components/dialog-manager';
  import { TextInput } from '@openshock/svelte-core/components/input';
  import { Badge } from '@openshock/svelte-core/components/ui/badge';
  import { Button } from '@openshock/svelte-core/components/ui/button';
  import * as Dialog from '@openshock/svelte-core/components/ui/dialog';
  import * as DropdownMenu from '@openshock/svelte-core/components/ui/dropdown-menu';
  import { handleApiError } from '#lib/errorhandling/apiErrorHandling.js';
  import { getConnection } from '#lib/signalr/user.svelte.js';
  import { serializeCaptivePortalMessage } from '#lib/signalr/serializers/CaptivePortal.js';
  import { serializeEmergencyStopMessage } from '#lib/signalr/serializers/EmergencyStop.js';
  import { serializeRebootMessage } from '#lib/signalr/serializers/Reboot.js';
  import { hubPairedSignals, refreshOwnHubs } from '#lib/state/hubs-state.svelte.js';
  import { copyToClipboard } from '@openshock/svelte-core/utils';
  import {
    CircleCheck,
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
  import { HubConnectionState, type HubConnection } from '@microsoft/signalr';
  import { toast } from 'svelte-sonner';

  interface Props {
    hub: Hub;
  }

  let { hub }: Props = $props();

  const copyId = () => copyToClipboard(hub.id, m.common_id_copied());

  async function sendHubCommand(send: (connection: HubConnection) => Promise<void>) {
    const connection = getConnection();
    if (connection?.state !== HubConnectionState.Connected) {
      toast.error(m.hub_toast_not_connected(), { description: m.hub_toast_try_later() });
      return;
    }
    try {
      await send(connection);
    } catch (error) {
      await handleApiError(error);
    }
  }

  async function confirmHubCommand(
    title: string,
    desc: string,
    confirmButtonText: string,
    send: (connection: HubConnection) => Promise<void>
  ) {
    const result = await dialog.confirm({ title, desc, confirmButtonText });
    if (!result.confirmed) return;
    await sendHubCommand(send);
  }

  const rebootHub = () =>
    confirmHubCommand(
      m.hub_reboot_title({ name: hub.name }),
      m.hub_reboot_desc(),
      m.hub_reboot(),
      (connection) => serializeRebootMessage(connection, hub.id)
    );

  const setCaptivePortal = (enabled: boolean) =>
    confirmHubCommand(
      enabled
        ? m.hub_hotspot_enable_title({ name: hub.name })
        : m.hub_hotspot_disable_title({ name: hub.name }),
      enabled ? m.hub_hotspot_enable_desc() : m.hub_hotspot_disable_desc(),
      enabled ? m.common_enable() : m.common_disable(),
      (connection) => serializeCaptivePortalMessage(connection, hub.id, enabled)
    );

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
      title: m.common_are_you_sure(),
      confirmButtonText: m.common_delete(),
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
    await dialog.open<{ loading: boolean; code: string | null; pairedBaseline: number }>({
      data: { loading: false, code: null, pairedBaseline: 0 },
      contentSnippet: pairSnippet,
    });
  }

  async function openRegenerateTokenDialog() {
    await dialog.open<{ loading: boolean; token: string | null }>({
      data: { loading: false, token: null },
      contentSnippet: regenerateTokenSnippet,
    });
  }

  async function generatePairCode(data: {
    loading: boolean;
    code: string | null;
    pairedBaseline: number;
  }) {
    data.loading = true;
    // Snapshot the paired counter so we only react to a consumption of *this* code.
    data.pairedBaseline = hubPairedSignals.get(hub.id) ?? 0;
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
    <Dialog.Title>{m.hub_edit_title()}</Dialog.Title>
  </Dialog.Header>
  <TextInput label={m.common_name()} placeholder={hub.name} bind:value={props.data.name} />
  <Button onclick={() => editHub(props.data.name.trim(), props.close)}
    >{m.terminal_cfg_apply()}</Button
  >
{/snippet}

{#snippet deleteDescSnippet(h: Hub)}
  <ParaglideMessage message={m.hub_delete_desc} inputs={{ name: h.name }}>
    {#snippet strong({ children })}<strong>{@render children?.()}</strong>{/snippet}
  </ParaglideMessage><br />
  {m.hub_delete_shockers()}
  <div class="flex justify-center gap-2 pt-2 text-sm sm:justify-start">
    {#each h.shockers as shocker (shocker.id)}
      <Badge>{shocker.name}</Badge>
    {/each}
  </div>
{/snippet}

{#snippet pairSnippet(
  props: DialogRenderProps<{ loading: boolean; code: string | null; pairedBaseline: number }>
)}
  {@const consumed =
    !!props.data.code && (hubPairedSignals.get(hub.id) ?? 0) > props.data.pairedBaseline}
  <Dialog.Header>
    <Dialog.Title>
      {props.data.loading
        ? m.common_generating()
        : consumed
          ? m.hub_pair_title_paired()
          : props.data.code
            ? m.hub_pair_title_generated()
            : m.hub_pair_title_generate()}
    </Dialog.Title>
    {#if !props.data.loading}
      <Dialog.Description>
        {#if consumed}
          <ParaglideMessage message={m.hub_pair_consumed} inputs={{ name: hub.name }}>
            {#snippet strong({ children })}<strong>{@render children?.()}</strong>{/snippet}
          </ParaglideMessage><br />
          {m.hub_pair_used()}
        {:else if props.data.code}
          <ParaglideMessage message={m.hub_pair_generated_for} inputs={{ name: hub.name }}>
            {#snippet strong({ children })}<strong>{@render children?.()}</strong>{/snippet}
          </ParaglideMessage><br />
          {m.hub_copy_now()}
        {:else}
          <ParaglideMessage message={m.hub_pair_generate_for} inputs={{ name: hub.name }}>
            {#snippet strong({ children })}<strong>{@render children?.()}</strong>{/snippet}
          </ParaglideMessage><br />
          {m.hub_pair_valid_for()}<br />
          {m.hub_pair_one_active()}
        {/if}
      </Dialog.Description>
    {/if}
  </Dialog.Header>
  {#if !props.data.loading}
    {#if consumed}
      <div class="text-success flex items-center gap-2">
        <CircleCheck class="size-5" />
        <span class="text-sm font-medium">{m.hub_pair_complete()}</span>
      </div>
      <Button onclick={props.close}>{m.common_done()}</Button>
    {:else if props.data.code}
      <div>
        <strong class="text-muted-foreground text-sm font-medium">{m.hub_pair_code_label()}</strong>
        <CopyInput value={props.data.code} />
      </div>
      <Button onclick={props.close}>{m.hub_pair_copied_close()}</Button>
    {:else}
      <Button onclick={() => generatePairCode(props.data)}>{m.hub_pair_get()}</Button>
    {/if}
  {/if}
{/snippet}

{#snippet regenerateTokenSnippet(
  props: DialogRenderProps<{ loading: boolean; token: string | null }>
)}
  <Dialog.Header>
    <Dialog.Title>
      {props.data.loading
        ? m.common_generating()
        : props.data.token
          ? m.hub_token_generated()
          : m.common_are_you_sure()}
    </Dialog.Title>
    {#if !props.data.loading}
      <Dialog.Description>
        {#if props.data.token}
          <ParaglideMessage message={m.hub_token_generated_for} inputs={{ name: hub.name }}>
            {#snippet strong({ children })}<strong>{@render children?.()}</strong>{/snippet}
          </ParaglideMessage><br />
          {m.hub_copy_now()}
        {:else}
          <ParaglideMessage message={m.hub_token_regenerate_for} inputs={{ name: hub.name }}>
            {#snippet strong({ children })}<strong>{@render children?.()}</strong>{/snippet}
          </ParaglideMessage><br />
          {m.hub_token_invalidate()}<br />
          {m.hub_token_confirm()}
        {/if}
      </Dialog.Description>
    {/if}
  </Dialog.Header>
  {#if !props.data.loading}
    {#if props.data.token}
      <div>
        <strong class="text-muted-foreground text-sm font-medium">{m.hub_token_label()}</strong>
        <CopyInput value={props.data.token} />
      </div>
      <Button onclick={props.close}>{m.hub_token_copied_close()}</Button>
    {:else}
      <Button onclick={() => regenerateToken(props.data)}>{m.hub_token_regenerate()}</Button>
    {/if}
  {/if}
{/snippet}

<TableActionMenu>
  <DropdownMenu.Label>{m.shocker_hub()}</DropdownMenu.Label>
  <DropdownMenu.Group>
    <DropdownMenu.Item class="cursor-pointer" onclick={() => goto(resolve(`hubs/${hub.id}/update`))}
      ><RefreshCw class="size-4" />{m.hub_menu_update()}</DropdownMenu.Item
    >

    <DropdownMenu.Item class="cursor-pointer" onclick={rebootHub}>
      <RotateCcw class="size-4" />
      {m.hub_reboot()}
    </DropdownMenu.Item>
    <DropdownMenu.Item class="cursor-pointer" onclick={() => setCaptivePortal(true)}>
      <Wifi class="size-4" />
      {m.hub_menu_hotspot_enable()}
    </DropdownMenu.Item>
    <DropdownMenu.Item class="cursor-pointer" onclick={() => setCaptivePortal(false)}>
      <WifiOff class="size-4" />
      {m.hub_menu_hotspot_disable()}
    </DropdownMenu.Item>
    <DropdownMenu.Item class="cursor-pointer" onclick={openPairDialog}>
      <Link class="size-4" />
      {m.hub_menu_pair()}
    </DropdownMenu.Item>
    <DropdownMenu.Item class="cursor-pointer" onclick={openRegenerateTokenDialog}>
      <KeyRound class="size-4" />
      {m.hub_token_regenerate()}
    </DropdownMenu.Item>
    <DropdownMenu.Item class="cursor-pointer" onclick={openEditDialog}>
      <Pencil class="size-4" />
      {m.common_edit()}
    </DropdownMenu.Item>
    <DropdownMenu.Separator />
    <DropdownMenu.Item class="cursor-pointer" onclick={copyId}>
      <Copy class="size-4" />
      {m.common_copy_id()}
    </DropdownMenu.Item>
    <DropdownMenu.Separator />
    <DropdownMenu.Item
      class="text-destructive cursor-pointer"
      onclick={() =>
        sendHubCommand((connection) => serializeEmergencyStopMessage(connection, hub.id))}
    >
      <OctagonX class="size-4" />
      {m.hub_menu_estop()}
    </DropdownMenu.Item>
    <DropdownMenu.Item class="text-destructive cursor-pointer" onclick={openDeleteDialog}>
      <Trash2 class="size-4" />
      {m.common_delete()}
    </DropdownMenu.Item>
  </DropdownMenu.Group>
</TableActionMenu>

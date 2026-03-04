<script lang="ts">
  import { Plus, Router } from '@lucide/svelte';
  import RotateCcw from '@lucide/svelte/icons/rotate-ccw';
  import type { SortingState } from '@tanstack/table-core';
  import Container from '$lib/components/Container.svelte';
  import DataTable from '$lib/components/Table/DataTableTemplate.svelte';
  import Button from '$lib/components/ui/button/button.svelte';
  import * as Card from '$lib/components/ui/card';
  import { IsMobile } from '$lib/hooks/is-mobile.svelte';
  import { breadcrumbs } from '$lib/state/Breadcrumbs.svelte';
  import { OnlineHubsStore, OwnHubsStore, refreshOwnHubs } from '$lib/stores/HubsStore';
  import { SemVer } from 'semver';
  import { onMount } from 'svelte';
  import { type Hub, columns } from './columns';
  import DataTableActions from './data-table-actions.svelte';
  import { dialog } from '$lib/components/dialog-manager/dialog-store.svelte';
  import type { DialogRenderProps } from '$lib/components/dialog-manager/types';
  import { hubManagementV2Api } from '$lib/api';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
  import * as Dialog from '$lib/components/ui/dialog';
  import TextInput from '$lib/components/input/TextInput.svelte';

  const isMobile = new IsMobile();

  let data = $derived.by<Hub[]>(() => {
    if (!$OwnHubsStore || !$OnlineHubsStore) return [];

    return Array.from($OwnHubsStore).map(([, hub]) => {
      const onlineState = $OnlineHubsStore.get(hub.id);
      return {
        id: hub.id,
        name: hub.name,
        is_online: onlineState?.isOnline ?? false,
        firmware_version: onlineState?.firmwareVersion
          ? new SemVer(onlineState.firmwareVersion)
          : null,
        shockers: hub.shockers.map((shocker) => {
          return {
            id: shocker.id,
            rf_id: shocker.rfId,
            model: shocker.model,
            name: shocker.name,
            is_paused: shocker.isPaused,
            created_at: shocker.createdOn,
          };
        }),
        created_at: hub.createdOn,
      };
    });
  });
  let sorting = $state<SortingState>([]);

  async function openCreateHubDialog() {
    const result = await dialog.open<{ name: string }, { name: string } | undefined>({
      data: { name: '' },
      contentSnippet: createHubSnippet,
    });
    if (!result) return;
    try {
      await hubManagementV2Api.devicesCreateDeviceV2({ name: result.name });
      await refreshOwnHubs();
    } catch (error) {
      handleApiError(error);
    }
  }

  breadcrumbs.push('Hubs', '/hubs');
  onMount(refreshOwnHubs);
</script>

{#snippet createHubSnippet(props: DialogRenderProps<{ name: string }, { name: string } | undefined>)}
  <Dialog.Header>
    <Dialog.Title>Create Hub</Dialog.Title>
  </Dialog.Header>
  <TextInput label="Hub Name" placeholder="My Hub" bind:value={props.data.name} />
  <Button disabled={!props.data.name.trim()} onclick={() => props.resolve({ name: props.data.name.trim() })}>
    Create
  </Button>
{/snippet}

<Container>
  <Card.Header class="w-full">
    <Card.Title class="flex items-center justify-between space-x-2 text-3xl">
      Hubs
      <div>
        <Button onclick={openCreateHubDialog}>
          <Plus />
          Add Hub
        </Button>
        <Button onclick={refreshOwnHubs}>
          <RotateCcw />
          Refresh
        </Button>
      </div>
    </Card.Title>
    <Card.Description>This is a list of all hubs you own.</Card.Description>
  </Card.Header>
  <div class="grid w-full gap-6 p-6">
    {#if isMobile.current}
      {#each data as hub (hub.id)}
        <div class="flex items-center justify-between gap-4">
          <div class="flex items-center gap-4">
            <Router class="size-8" />
            <div class="flex flex-col">
              <strong>{hub.name}</strong>
              {#if hub.firmware_version}
                <span>{hub.firmware_version}</span>
              {:else}
                <span class="text-red-500">Offline</span>
              {/if}
            </div>
          </div>
          <DataTableActions {hub} />
        </div>
      {/each}
    {:else}
      <DataTable {data} {columns} {sorting} />
    {/if}
  </div>
</Container>

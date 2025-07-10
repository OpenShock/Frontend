<script lang="ts">
  import { Plus, Router } from '@lucide/svelte';
  import RotateCcw from '@lucide/svelte/icons/rotate-ccw';
  import type { SortingState } from '@tanstack/table-core';
  import Container from '$lib/components/Container.svelte';
  import DataTable from '$lib/components/Table/DataTableTemplate.svelte';
  import Button from '$lib/components/ui/button/button.svelte';
  import * as Card from '$lib/components/ui/card';
  import { OnlineHubsStore, OwnHubsStore, refreshOwnHubs } from '$lib/stores/HubsStore';
  import { SemVer } from 'semver';
  import { onMount } from 'svelte';
  import { type Hub, columns } from './columns';
  import DataTableActions from './data-table-actions.svelte';

  let innerWidth = $state<number>(0);

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

  let showAddHubModal = $state<boolean>(false);

  onMount(refreshOwnHubs);
</script>

<svelte:window bind:innerWidth />
<Container>
  <Card.Header class="w-full">
    <Card.Title class="flex items-center justify-between space-x-2 text-3xl">
      Hubs
      <div>
        <Button onclick={() => (showAddHubModal = true)}>
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
  <div class="w-full p-6 gap-6 grid">
    {#if innerWidth < 800}
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

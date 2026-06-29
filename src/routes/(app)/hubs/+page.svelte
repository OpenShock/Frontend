<script lang="ts">
  import { devicesCreateDeviceV2 } from '$lib/api';
  import { Plus, Router } from '@lucide/svelte';
  import RotateCcw from '@lucide/svelte/icons/rotate-ccw';
  import { Button } from '@openshock/svelte-core/components/ui/button/index.js';
  import * as Table from '@openshock/svelte-core/components/ui/table/index.js';
  import { IsMobile } from '@openshock/svelte-core/hooks/is-mobile.svelte.js';
  import { registerBreadcrumbs } from '$lib/state/breadcrumbs-state.svelte';
  import { onlineHubs, ownHubs, refreshOwnHubs } from '$lib/state/hubs-state.svelte';
  import { onMount } from 'svelte';
  import type { Hub } from './columns';
  import DataTableActions from './data-table-actions.svelte';
  import { dialog } from '@openshock/svelte-core/components/dialog-manager/index.js';
  import type { DialogRenderProps } from '@openshock/svelte-core/components/dialog-manager/index.js';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';

  import * as Dialog from '@openshock/svelte-core/components/ui/dialog/index.js';
  import { TextInput } from '@openshock/svelte-core/components/input/index.js';
  import { PageHeader } from '@openshock/svelte-core/components/index.js';
  import { Container } from '@openshock/svelte-core/components/index.js';

  const isMobile = new IsMobile();

  let data = $derived.by<Hub[]>(() => {
    return ownHubs
      .values()
      .map((hub) => {
        const onlineState = onlineHubs.get(hub.id);
        return {
          id: hub.id,
          name: hub.name,
          is_online: onlineState?.isOnline ?? false,
          firmware_version: onlineState?.firmwareVersion ?? null,
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
      })
      .toArray();
  });

  async function openCreateHubDialog() {
    const result = await dialog.open<{ name: string }, { name: string } | undefined>({
      data: { name: '' },
      contentSnippet: createHubSnippet,
    });
    if (!result) return;
    try {
      await devicesCreateDeviceV2({ body: { name: result.name } });
      await refreshOwnHubs();
    } catch (error) {
      handleApiError(error);
    }
  }

  registerBreadcrumbs(() => [{ label: 'Hubs', href: '/hubs' }]);
  onMount(refreshOwnHubs);
</script>

{#snippet createHubSnippet(
  props: DialogRenderProps<{ name: string }, { name: string } | undefined>
)}
  <Dialog.Header>
    <Dialog.Title>Create Hub</Dialog.Title>
  </Dialog.Header>
  <TextInput label="Hub Name" placeholder="My Hub" bind:value={props.data.name} />
  <Button
    disabled={!props.data.name.trim()}
    onclick={() => props.resolve({ name: props.data.name.trim() })}
  >
    Create
  </Button>
{/snippet}

<Container class="w-full">
  <PageHeader title="Hubs" subtitle="This is a list of all hubs you own">
    <Button onclick={openCreateHubDialog}>
      <Plus />
      Add Hub
    </Button>
    <Button onclick={refreshOwnHubs}>
      <RotateCcw />
      Refresh
    </Button>
  </PageHeader>

  {#if isMobile.current}
    <div class="grid w-full gap-6">
      {#each data as hub (hub.id)}
        <div class="flex items-center justify-between gap-4">
          <div class="flex items-center gap-4">
            <Router class="size-8" />
            <div class="flex flex-col">
              <strong>{hub.name}</strong>
              {#if hub.is_online && hub.firmware_version}
                <span>{hub.firmware_version}</span>
              {:else}
                <span class="text-red-500">Offline</span>
              {/if}
            </div>
          </div>
          <DataTableActions {hub} />
        </div>
      {/each}
    </div>
  {:else}
    <Table.Root>
      <Table.Header>
        <Table.Row>
          <Table.Head>Name</Table.Head>
          <Table.Head>Status</Table.Head>
          <Table.Head>Version</Table.Head>
          <Table.Head>Created</Table.Head>
          <Table.Head class="w-0"></Table.Head>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {#each data as hub (hub.id)}
          <Table.Row>
            <Table.Cell>{hub.name}</Table.Cell>
            <Table.Cell>
              {#if hub.is_online}
                <span class="text-green-500">Online</span>
              {:else}
                <span class="text-red-500">Offline</span>
              {/if}
            </Table.Cell>
            <Table.Cell>{hub.firmware_version ?? '—'}</Table.Cell>
            <Table.Cell>
              {hub.created_at.toLocaleString(undefined, { dateStyle: 'short' })}
            </Table.Cell>
            <Table.Cell>
              <DataTableActions {hub} />
            </Table.Cell>
          </Table.Row>
        {:else}
          <Table.Row>
            <Table.Cell colspan={5} class="h-24 text-center">No hubs found.</Table.Cell>
          </Table.Row>
        {/each}
      </Table.Body>
    </Table.Root>
  {/if}
</Container>

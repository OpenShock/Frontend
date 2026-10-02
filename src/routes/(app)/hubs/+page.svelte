<script lang="ts">
  import { devicesCreateDeviceV2 } from '#lib/api/index.js';
  import { Plus, Router } from '@lucide/svelte';
  import RotateCcw from '@lucide/svelte/icons/rotate-ccw';
  import { Button } from '@openshock/svelte-core/components/ui/button';
  import * as Table from '@openshock/svelte-core/components/ui/table';
  import { IsMobile } from '@openshock/svelte-core/hooks';
  import { registerBreadcrumbs } from '#lib/state/breadcrumbs-state.svelte.js';
  import { onlineHubs, ownHubs, refreshOwnHubs } from '#lib/state/hubs-state.svelte.js';
  import { onMount } from 'svelte';
  import type { Hub } from './columns';
  import DataTableActions from './data-table-actions.svelte';
  import { dialog, type DialogRenderProps } from '@openshock/svelte-core/components/dialog-manager';
  import { handleApiError } from '#lib/errorhandling/apiErrorHandling.js';

  import * as Dialog from '@openshock/svelte-core/components/ui/dialog';
  import { TextInput } from '@openshock/svelte-core/components/input';
  import { PageHeader, Container, EmptyState } from '@openshock/svelte-core/components';

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

  registerBreadcrumbs(() => [{ label: 'Hubs', href: 'hubs' }]);
  onMount(refreshOwnHubs);
</script>

{#snippet createHubSnippet(
  props: DialogRenderProps<{ name: string }, { name: string } | undefined>
)}
  <Dialog.Header>
    <Dialog.Title>Create hub</Dialog.Title>
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
  <PageHeader title="Hubs" subtitle="Every hub registered to your account.">
    <Button onclick={openCreateHubDialog}>
      <Plus />
      Add Hub
    </Button>
    <Button variant="outline" onclick={refreshOwnHubs}>
      <RotateCcw />
      Refresh
    </Button>
  </PageHeader>

  {#if data.length === 0}
    <EmptyState
      icon={Router}
      title="No hubs yet"
      description="A hub is the device that relays commands to your shockers. Add one to get started."
    >
      <Button size="lg" onclick={openCreateHubDialog}><Plus />Add Hub</Button>
    </EmptyState>
  {:else if isMobile.current}
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
                <span class="text-destructive">Offline</span>
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
                <span class="text-success">Online</span>
              {:else}
                <span class="text-destructive">Offline</span>
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
        {/each}
      </Table.Body>
    </Table.Root>
  {/if}
</Container>

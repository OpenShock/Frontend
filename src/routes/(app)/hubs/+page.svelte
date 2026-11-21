<script lang="ts">
  import { m } from '#lib/paraglide/messages.js';
  import { devicesCreateDeviceV2 } from '#lib/api/index.js';
  import { Plus, Router } from '@lucide/svelte';
  import RotateCcw from '@lucide/svelte/icons/rotate-ccw';
  import { Button } from '@openshock/svelte-core/components/ui/button';
  import * as Table from '@openshock/svelte-core/components/ui/table';
  import { IsMobile } from '@openshock/svelte-core/hooks';
  import { registerBreadcrumbs } from '#lib/state/breadcrumbs-state.svelte.js';
  import {
    onlineHubs,
    ownHubs,
    ownHubsStatus,
    refreshOwnHubs,
  } from '#lib/state/hubs-state.svelte.js';
  import { onMount } from 'svelte';
  import { intlLocale } from '#lib/i18n/intl.js';
  import type { Hub } from './columns';
  import DataTableActions from './data-table-actions.svelte';
  import { dialog, type DialogRenderProps } from '@openshock/svelte-core/components/dialog-manager';
  import { handleApiError } from '#lib/errorhandling/apiErrorHandling.js';

  import * as Dialog from '@openshock/svelte-core/components/ui/dialog';
  import { TextInput } from '@openshock/svelte-core/components/input';
  import {
    PageHeader,
    Container,
    EmptyState,
    PageError,
    PageLoading,
  } from '@openshock/svelte-core/components';

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

  registerBreadcrumbs(() => [{ label: m.hubs_title(), href: 'hubs' }]);
  onMount(refreshOwnHubs);
</script>

{#snippet createHubSnippet(
  props: DialogRenderProps<{ name: string }, { name: string } | undefined>
)}
  <Dialog.Header>
    <Dialog.Title>{m.hubs_create_title()}</Dialog.Title>
  </Dialog.Header>
  <TextInput
    label={m.hubs_name_label()}
    placeholder={m.hubs_name_placeholder()}
    bind:value={props.data.name}
  />
  <Button
    disabled={!props.data.name.trim()}
    onclick={() => props.resolve({ name: props.data.name.trim() })}
  >
    {m.common_create()}
  </Button>
{/snippet}

<Container class="w-full">
  <PageHeader title={m.hubs_title()} subtitle={m.hubs_subtitle()}>
    <Button onclick={openCreateHubDialog}>
      <Plus />
      {m.hubs_add()}
    </Button>
    <Button variant="outline" onclick={refreshOwnHubs}>
      <RotateCcw />
      {m.common_refresh()}
    </Button>
  </PageHeader>

  {#if !ownHubsStatus.loaded && ownHubsStatus.failed}
    <PageError message={m.hubs_load_failed()} onRetry={refreshOwnHubs} />
  {:else if !ownHubsStatus.loaded}
    <PageLoading />
  {:else if data.length === 0}
    <EmptyState icon={Router} title={m.hubs_empty_title()} description={m.hubs_empty_desc()}>
      <Button size="lg" onclick={openCreateHubDialog}><Plus />{m.hubs_add()}</Button>
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
                <span class="text-destructive">{m.common_offline()}</span>
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
          <Table.Head>{m.common_name()}</Table.Head>
          <Table.Head>{m.common_status()}</Table.Head>
          <Table.Head>{m.common_version()}</Table.Head>
          <Table.Head>{m.common_created()}</Table.Head>
          <Table.Head class="w-0"></Table.Head>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {#each data as hub (hub.id)}
          <Table.Row>
            <Table.Cell>{hub.name}</Table.Cell>
            <Table.Cell>
              {#if hub.is_online}
                <span class="text-success">{m.common_online()}</span>
              {:else}
                <span class="text-destructive">{m.common_offline()}</span>
              {/if}
            </Table.Cell>
            <Table.Cell>{hub.firmware_version ?? '—'}</Table.Cell>
            <Table.Cell>
              {hub.created_at.toLocaleString(intlLocale(), { dateStyle: 'short' })}
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

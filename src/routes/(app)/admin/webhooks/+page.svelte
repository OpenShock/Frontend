<script lang="ts">
  import { RotateCcw } from '@lucide/svelte';
  import { adminListWebhooks } from '$lib/api';
  import type { WebhookDto } from '$lib/api';
  import { Container } from '@openshock/svelte-core/components';
  import { Spinner } from '@openshock/svelte-core/components/ui/spinner';
  import {
    CreateColumnDefs,
    LocaleDateTimeRenderer,
    RenderCell,
  } from '$lib/components/Table/ColumnUtils';
  import DataTable from '$lib/components/Table/DataTableTemplate.svelte';
  import { Button } from '@openshock/svelte-core/components/ui/button';
  import { CardHeader, CardTitle } from '@openshock/svelte-core/components/ui/card';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
  import DataTableActions from './data-table-actions.svelte';
  import { registerBreadcrumbs } from '$lib/state/breadcrumbs-state.svelte';
  import WebhookAddDialog from './dialog-webhook-add.svelte';
  import { features, type Features } from './data-table-features';

  registerBreadcrumbs(() => [{ label: 'Webhooks' }]);

  const { CreateSortableColumnDef, CreateActionsColumnDef } = CreateColumnDefs<
    Features,
    WebhookDto
  >();

  const columns = [
    CreateSortableColumnDef('name', 'Name', RenderCell),
    CreateSortableColumnDef('url', 'Url', RenderCell),
    CreateSortableColumnDef('createdAt', 'Created at', LocaleDateTimeRenderer),
    CreateActionsColumnDef(DataTableActions, (webhook) => ({ webhook })),
  ];

  let data = $derived(await adminListWebhooks());

  let addDialogOpen = $state<boolean>(false);

  async function refresh() {
    try {
      data = await adminListWebhooks();
    } catch (error) {
      await handleApiError(error);
    }
  }
</script>

<WebhookAddDialog bind:open={addDialogOpen} onAdded={refresh} />

<Container>
  <CardHeader class="w-full">
    <CardTitle class="flex items-center justify-between space-x-2 text-3xl">
      Webhooks
      <Button onclick={() => (addDialogOpen = true)}>Add new</Button>
      <Button class="text-xl" onclick={refresh}>
        <RotateCcw />
        <span> Refresh </span>
      </Button>
    </CardTitle>
  </CardHeader>
  <div class="grid w-full gap-6 p-6">
    <svelte:boundary onerror={(error: unknown) => handleApiError(error)}>
      <DataTable {data} {columns} {features} />

      {#snippet pending()}
        <div class="flex h-64 w-full items-center justify-center">
          <Spinner class="size-8 text-gray-600 dark:text-gray-300" />
        </div>
      {/snippet}

      {#snippet failed(_error: unknown, reset: () => void)}
        <div class="flex w-full flex-col items-center gap-3 py-12">
          <p class="text-destructive text-sm">Failed to load webhooks.</p>
          <Button variant="outline" onclick={reset}>Try again</Button>
        </div>
      {/snippet}
    </svelte:boundary>
  </div>
</Container>

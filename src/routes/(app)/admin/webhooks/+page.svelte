<script lang="ts">
  import { Plus, RotateCcw } from '@lucide/svelte';
  import { adminListWebhooks } from '#lib/api/index.js';
  import type { WebhookDto } from '#lib/api/index.js';
  import { Container, PageHeader } from '@openshock/svelte-core/components';
  import { Spinner } from '@openshock/svelte-core/components/ui/spinner';
  import {
    CreateColumnDefs,
    LocaleDateTimeRenderer,
    RenderCell,
  } from '#lib/components/Table/ColumnUtils.js';
  import DataTable from '#lib/components/Table/DataTableTemplate.svelte';
  import { Button } from '@openshock/svelte-core/components/ui/button';
  import { handleApiError } from '#lib/errorhandling/apiErrorHandling.js';
  import DataTableActions from './data-table-actions.svelte';
  import { registerBreadcrumbs } from '#lib/state/breadcrumbs-state.svelte.js';
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
  <PageHeader title="Webhooks" subtitle="Outgoing webhooks this instance will call.">
    <Button onclick={() => (addDialogOpen = true)}><Plus />Add Webhook</Button>
    <Button variant="outline" onclick={refresh}>
      <RotateCcw />
      Refresh
    </Button>
  </PageHeader>
  <div class="flex min-h-0 w-full min-w-0 flex-1 flex-col gap-6">
    <svelte:boundary onerror={(error: unknown) => handleApiError(error)}>
      <DataTable {data} {columns} {features} mobileColumns={['name']} />

      {#snippet pending()}
        <div class="flex h-64 w-full items-center justify-center">
          <Spinner class="text-muted-foreground size-8" />
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

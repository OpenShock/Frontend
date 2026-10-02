<script lang="ts">
  import { Plus } from '@lucide/svelte';
  import { adminConfigurationList } from '#lib/api/index.js';
  import type { ConfigurationItemDto } from '#lib/api/index.js';
  import { Container, PageHeader } from '@openshock/svelte-core/components';
  import {
    CreateColumnDefs,
    LocaleDateTimeRenderer,
    RenderCell,
  } from '#lib/components/Table/ColumnUtils.js';
  import { registerBreadcrumbs } from '#lib/state/breadcrumbs-state.svelte.js';
  import DataTable from '#lib/components/Table/DataTableTemplate.svelte';
  import { Button } from '@openshock/svelte-core/components/ui/button';
  import { handleApiError } from '#lib/errorhandling/apiErrorHandling.js';
  import { onMount } from 'svelte';
  import DataTableActions from './data-table-actions.svelte';
  import WebhookAddDialog from './dialog-item-add.svelte';
  import { features, type Features } from './data-table-features';

  registerBreadcrumbs(() => [{ label: 'Config' }]);

  const { CreateSortableColumnDef, CreateActionsColumnDef } = CreateColumnDefs<
    Features,
    ConfigurationItemDto
  >();

  const columns = [
    CreateSortableColumnDef('name', 'Name', RenderCell),
    CreateSortableColumnDef('description', 'Description', RenderCell),
    CreateSortableColumnDef('type', 'Type', RenderCell),
    CreateSortableColumnDef('value', 'Value', RenderCell),
    CreateSortableColumnDef('updatedAt', 'Updated at', LocaleDateTimeRenderer),
    CreateSortableColumnDef('createdAt', 'Created at', LocaleDateTimeRenderer),
    CreateActionsColumnDef(DataTableActions, (item) => ({ item, onChange: fetchWebhooks })),
  ];

  let data = $state<ConfigurationItemDto[]>([]);

  let addDialogOpen = $state<boolean>(false);

  function fetchWebhooks() {
    adminConfigurationList()
      .then((res) => {
        data = res;
      })
      .catch(handleApiError);
  }

  onMount(fetchWebhooks);
</script>

<WebhookAddDialog bind:open={addDialogOpen} onAdded={fetchWebhooks} />

<Container>
  <PageHeader title="Configuration" subtitle="Runtime configuration values for this instance.">
    <Button onclick={() => (addDialogOpen = true)}><Plus />Add Value</Button>
  </PageHeader>
  <div class="flex min-h-0 w-full min-w-0 flex-1 flex-col gap-6">
    <DataTable {data} {columns} {features} mobileColumns={['name', 'value']} />
  </div>
</Container>

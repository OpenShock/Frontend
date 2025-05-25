<script lang="ts">
  import type { SortingState } from '@tanstack/table-core';
  import { adminApi } from '$lib/api';
  import type { WebhookDto } from '$lib/api/internal/v1';
  import DataTable from '$lib/components/Table/DataTableTemplate.svelte';
  import { Button } from '$lib/components/ui/button';
  import { CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
  import { onMount } from 'svelte';
  import { columns } from './columns';
  import WebhookAddDialog from './dialog-webhook-add.svelte';

  let data = $state<WebhookDto[]>([]);
  let sorting = $state<SortingState>([]);

  let addDialogOpen = $state<boolean>(false);

  function fetchWebhooks() {
    adminApi
      .adminListWebhooks()
      .then((res) => {
        data = res;
      })
      .catch(handleApiError);
  }

  onMount(fetchWebhooks);
</script>

<WebhookAddDialog bind:open={addDialogOpen} onAdded={fetchWebhooks} />

<div class="container my-8">
  <CardHeader>
    <CardTitle class="flex items-center justify-between space-x-2 text-3xl">
      Webhooks
      <Button onclick={() => (addDialogOpen = true)}>Add new</Button>
    </CardTitle>
  </CardHeader>
  <CardContent>
    <DataTable {data} {columns} {sorting} />
  </CardContent>
</div>

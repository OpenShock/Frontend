<script lang="ts">
  import { adminListAutomationTokens } from '#lib/api/index.js';
  import { Bot, Plus, RotateCcw } from '@lucide/svelte';
  import {
    Container,
    EmptyState,
    PageHeader,
    PageLoading,
  } from '@openshock/svelte-core/components';
  import DataTable from '#lib/components/Table/DataTableTemplate.svelte';
  import { Button } from '@openshock/svelte-core/components/ui/button';
  import { handleApiError } from '#lib/errorhandling/apiErrorHandling.js';
  import { registerBreadcrumbs } from '#lib/state/breadcrumbs-state.svelte.js';
  import { onMount } from 'svelte';
  import { createColumns, toAutomationToken, type AutomationToken } from './columns';
  import { features } from './data-table-features';
  import TokenCreateDialog from './dialog-token-create.svelte';

  registerBreadcrumbs(() => [{ label: 'Automation Tokens' }]);

  let data = $state<AutomationToken[]>([]);
  let hasLoaded = $state(false);
  let isFetching = $state(false);
  let createDialogOpen = $state(false);

  const columns = createColumns(fetchTokens);

  function fetchTokens() {
    isFetching = true;
    adminListAutomationTokens()
      .then((tokens) => {
        data = tokens.map(toAutomationToken);
      })
      .catch(handleApiError)
      .finally(() => {
        isFetching = false;
        hasLoaded = true;
      });
  }
  onMount(fetchTokens);
</script>

<TokenCreateDialog bind:open={createDialogOpen} onCreated={fetchTokens} />

<Container>
  <PageHeader
    title="Automation Tokens"
    subtitle="Secrets that let automated clients bypass selected signup protections."
  >
    <Button onclick={() => (createDialogOpen = true)}>
      <Plus />
      Create token
    </Button>
    <Button variant="outline" onclick={fetchTokens} disabled={isFetching}>
      <RotateCcw class={isFetching ? 'animate-spin' : ''} />
      Refresh
    </Button>
  </PageHeader>

  <div class="flex min-h-0 w-full min-w-0 flex-1 flex-col gap-6">
    {#if !hasLoaded}
      <PageLoading />
    {:else if data.length === 0}
      <EmptyState
        icon={Bot}
        title="No automation tokens"
        description="Create one to let an automated client sign accounts up without Turnstile or rate limiting."
      >
        <Button onclick={() => (createDialogOpen = true)}>
          <Plus />
          Create token
        </Button>
      </EmptyState>
    {:else}
      <DataTable {data} {columns} {features} mobileColumns={['name', 'useCount']} class="w-full" />
    {/if}
  </div>
</Container>

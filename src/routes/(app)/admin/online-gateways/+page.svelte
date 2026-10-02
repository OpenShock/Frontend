<script lang="ts">
  import { RotateCcw } from '@lucide/svelte';
  import { adminGetOnlineGateways } from '#lib/api/index.js';
  import { Container, PageHeader, PageLoading } from '@openshock/svelte-core/components';
  import DataTable from '#lib/components/Table/DataTableTemplate.svelte';
  import { Button } from '@openshock/svelte-core/components/ui/button';
  import { Input } from '@openshock/svelte-core/components/ui/input';
  import { handleApiError } from '#lib/errorhandling/apiErrorHandling.js';
  import { registerBreadcrumbs } from '#lib/state/breadcrumbs-state.svelte.js';
  import { countryName } from '#lib/utils/index.js';
  import { onMount } from 'svelte';
  import { HIGH_LOAD_PERCENT, columns, toOnlineGateway, type OnlineGateway } from './columns';
  import { features } from './data-table-features';

  registerBreadcrumbs(() => [{ label: 'Online Gateways' }]);

  let data = $state<OnlineGateway[]>([]);
  let hasLoaded = $state(false);
  let isFetching = $state(false);
  let search = $state('');

  function fetchOnlineGateways() {
    isFetching = true;
    adminGetOnlineGateways()
      .then((gateways) => {
        data = gateways.map(toOnlineGateway);
      })
      .catch(handleApiError)
      .finally(() => {
        isFetching = false;
        hasLoaded = true;
      });
  }
  onMount(fetchOnlineGateways);

  let filtered = $derived.by(() => {
    const query = search.trim().toLowerCase();
    if (!query) return data;
    return data.filter((gateway) =>
      [
        gateway.id,
        gateway.endpoint,
        gateway.country,
        countryName(gateway.country),
        gateway.environment,
      ].some((field) => field?.toLowerCase().includes(query))
    );
  });

  let stats = $derived.by(() => {
    const loads = data.map((gateway) => gateway.load);
    const maxLoad = loads.length === 0 ? null : Math.max(...loads);
    const connectedHubs = data.reduce((sum, gateway) => sum + gateway.connectedHubs, 0);
    const countries = new Set(
      data.flatMap((gateway) => (countryName(gateway.country) === null ? [] : [gateway.country]))
    );

    return [
      { label: 'Online gateways', value: data.length.toString() },
      { label: 'Connected hubs', value: connectedHubs.toString() },
      { label: 'Countries', value: countries.size.toString() },
      {
        label: 'Highest load',
        value: maxLoad === null ? '—' : `${maxLoad}%`,
        detail: `Alerts at ≥ ${HIGH_LOAD_PERCENT}%`,
        color: maxLoad !== null && maxLoad >= HIGH_LOAD_PERCENT ? 'text-destructive' : '',
      },
    ];
  });
</script>

<Container>
  <PageHeader
    title="Online Gateways"
    subtitle="Gateways currently advertising themselves for hub assignment."
  >
    <Input
      placeholder="Search gateways, endpoints, countries..."
      bind:value={search}
      class="w-64"
    />
    <Button variant="outline" onclick={fetchOnlineGateways} disabled={isFetching}>
      <RotateCcw class={isFetching ? 'animate-spin' : ''} />
      Refresh
    </Button>
  </PageHeader>

  <div class="flex min-h-0 w-full min-w-0 flex-1 flex-col gap-6">
    <div class="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {#each stats as stat (stat.label)}
        <div class="bg-card flex min-w-0 flex-col rounded-lg border p-4">
          <span class="text-muted-foreground text-sm">{stat.label}</span>
          <span class="truncate text-2xl font-bold {stat.color ?? ''}" title={stat.value}>
            {hasLoaded ? stat.value : '—'}
          </span>
          {#if hasLoaded && stat.detail}
            <span class="text-muted-foreground truncate text-xs" title={stat.detail}>
              {stat.detail}
            </span>
          {/if}
        </div>
      {/each}
    </div>

    {#if hasLoaded}
      <DataTable
        data={filtered}
        {columns}
        {features}
        mobileColumns={['id', 'load']}
        class="w-full"
      />
    {:else}
      <PageLoading />
    {/if}
  </div>
</Container>

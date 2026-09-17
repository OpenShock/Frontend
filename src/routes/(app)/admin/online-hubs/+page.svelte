<script lang="ts" module>
  import { formatBoardName, parseOpenShockUserAgent } from '$lib/utils/userAgent';
  import { countryName, type OnlineHub } from './columns';

  type Dimension = 'firmware' | 'board' | 'country' | 'gateway';

  const dimensions: Record<
    Dimension,
    {
      title: string;
      color: { light: string; dark: string };
      value: (hub: OnlineHub) => string | null;
    }
  > = {
    firmware: {
      title: 'Firmware',
      color: { light: '#2a78d6', dark: '#3987e5' },
      value: (hub) => hub.firmwareVersion.version,
    },
    board: {
      title: 'Board',
      color: { light: '#a9489f', dark: '#bf5ab8' },
      value: (hub) => (hub.userAgent && parseOpenShockUserAgent(hub.userAgent)?.board) || null,
    },
    country: {
      title: 'Country',
      color: { light: '#eb6834', dark: '#d95926' },
      value: (hub) => hub.country || null,
    },
    gateway: {
      title: 'Gateway',
      color: { light: '#1baf7a', dark: '#199e70' },
      value: (hub) => hub.gateway,
    },
  };

  const bucketLabel: Record<Dimension, (key: string | null) => string> = {
    firmware: (key) => key ?? 'Unknown',
    country: (key) => countryName(key) ?? 'Unknown',
    gateway: (key) => key?.split('.')[0] ?? 'Unknown',
    board: (key) => (key ? formatBoardName(key) : 'Unknown'),
  };
</script>

<script lang="ts">
  import { RotateCcw, X } from '@lucide/svelte';
  import { adminGetOnlineDevices } from '$lib/api';
  import { Container, PageHeader } from '@openshock/svelte-core/components';
  import DataTable from '$lib/components/Table/DataTableTemplate.svelte';
  import { Button } from '@openshock/svelte-core/components/ui/button';
  import { Input } from '@openshock/svelte-core/components/ui/input';
  import { Spinner } from '@openshock/svelte-core/components/ui/spinner';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
  import { SemVer } from 'semver';
  import { onMount } from 'svelte';
  import { registerBreadcrumbs } from '$lib/state/breadcrumbs-state.svelte';
  import { HIGH_LATENCY_MS, WEAK_RSSI_DBM, columns } from './columns';
  import DistributionChart, { bucketize } from './distribution-chart.svelte';
  import { features } from './data-table-features';

  registerBreadcrumbs(() => [{ label: 'Online Hubs' }]);

  let data = $state<OnlineHub[]>([]);
  let hasLoaded = $state(false);
  let isFetching = $state(false);
  let search = $state('');
  let filter = $state<{ dimension: Dimension; key: string } | null>(null);

  function fetchOnlineHubs() {
    isFetching = true;
    adminGetOnlineDevices()
      .then((res) => {
        if (res.data) {
          data = res.data.map((x) => ({ ...x, firmwareVersion: new SemVer(x.firmwareVersion) }));
        }
      })
      .catch(handleApiError)
      .finally(() => {
        isFetching = false;
        hasLoaded = true;
      });
  }
  onMount(fetchOnlineHubs);

  let filtered = $derived.by(() => {
    const query = search.trim().toLowerCase();
    return data.filter((hub) => {
      if (filter && (dimensions[filter.dimension].value(hub) ?? '') !== filter.key) return false;
      if (!query) return true;
      return [
        hub.name,
        hub.owner.name,
        hub.gateway,
        hub.firmwareVersion.version,
        hub.id,
        hub.country,
        countryName(hub.country),
        hub.ip,
        dimensions.board.value(hub),
      ].some((field) => field?.toLowerCase().includes(query));
    });
  });

  function median(values: number[]): number | null {
    if (values.length === 0) return null;
    const sorted = values.toSorted((a, b) => a - b);
    const mid = sorted.length >> 1;
    return sorted.length % 2 ? sorted[mid] : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
  }

  let stats = $derived.by(() => {
    const latencies = data.flatMap((h) => (h.latencyMs === null ? [] : [h.latencyMs]));
    const medianLatency = median(latencies);
    const weakSignal = data.filter((h) => h.rssi !== null && h.rssi <= WEAK_RSSI_DBM).length;

    return [
      { label: 'Online hubs', value: data.length.toString() },
      { label: 'Owners', value: new Set(data.map((h) => h.owner.id)).size.toString() },
      {
        label: 'Median latency',
        value: medianLatency === null ? '—' : `${medianLatency} ms`,
        color: medianLatency !== null && medianLatency >= HIGH_LATENCY_MS ? 'text-orange-500' : '',
      },
      {
        label: 'Weak signal',
        value: weakSignal.toString(),
        detail: `RSSI ≤ ${WEAK_RSSI_DBM} dBm`,
        color: weakSignal > 0 ? 'text-red-500' : '',
      },
    ];
  });

  let charts = $derived(
    (Object.keys(dimensions) as Dimension[]).map((dimension) => ({
      dimension,
      title: dimensions[dimension].title,
      color: dimensions[dimension].color,
      buckets: bucketize(data.map(dimensions[dimension].value), bucketLabel[dimension]),
    }))
  );

  let filterLabel = $derived(
    filter &&
      `${dimensions[filter.dimension].title}: ${bucketLabel[filter.dimension](filter.key || null)}`
  );
</script>

<Container>
  <PageHeader title="Online Hubs" subtitle="Hubs currently connected to a gateway.">
    <Input placeholder="Search hubs, owners, countries, IPs..." bind:value={search} class="w-64" />
    <Button variant="outline" onclick={fetchOnlineHubs} disabled={isFetching}>
      <RotateCcw class={isFetching ? 'animate-spin' : ''} />
      Refresh
    </Button>
  </PageHeader>

  <div class="flex w-full min-w-0 flex-col gap-6">
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
      <div class="grid grid-cols-1 gap-3 lg:grid-cols-2">
        {#each charts as chart (chart.dimension)}
          <DistributionChart
            title={chart.title}
            color={chart.color}
            buckets={chart.buckets}
            selected={filter?.dimension === chart.dimension ? filter.key : null}
            onSelect={(key) => (filter = key === null ? null : { dimension: chart.dimension, key })}
          />
        {/each}
      </div>

      {#if filterLabel}
        <div class="flex items-center gap-2 text-sm">
          <span class="text-muted-foreground">Filtered by</span>
          <Button variant="secondary" size="sm" onclick={() => (filter = null)}>
            {filterLabel}
            <X />
          </Button>
        </div>
      {/if}

      <DataTable data={filtered} {columns} {features} class="w-full" />
    {:else}
      <div class="flex h-64 w-full items-center justify-center">
        <Spinner class="size-8 text-gray-600 dark:text-gray-300" />
      </div>
    {/if}
  </div>
</Container>

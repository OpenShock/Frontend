<script lang="ts" module>
  import { countryName } from '#lib/utils/index.js';
  import { formatBoardName, parseOpenShockUserAgent } from '#lib/utils/userAgent.js';
  import { asnLabel, networkName, type OnlineHub } from './columns';

  type Dimension = 'firmware' | 'board' | 'country' | 'network' | 'gateway';

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
    network: {
      title: 'Network',
      color: { light: '#c98500', dark: '#d99a1e' },
      value: (hub) => (hub.network ? asnLabel(hub.network.asn) : null),
    },
    gateway: {
      title: 'Gateway',
      color: { light: '#1baf7a', dark: '#199e70' },
      value: (hub) => hub.gateway,
    },
  };

  // Network buckets are keyed by ASN, so their label needs the org seen on the hubs themselves.
  function bucketLabels(hubs: OnlineHub[]): Record<Dimension, (key: string | null) => string> {
    const networks = new Map(
      hubs.flatMap((hub) =>
        hub.network ? [[asnLabel(hub.network.asn), hub.network] as const] : []
      )
    );
    return {
      ...bucketLabel,
      network: (key) => {
        const network = key === null ? undefined : networks.get(key);
        return network ? `${networkName(network)} (${key})` : (key ?? 'Unknown');
      },
    };
  }

  const bucketLabel: Record<Exclude<Dimension, 'network'>, (key: string | null) => string> = {
    firmware: (key) => key ?? 'Unknown',
    country: (key) => countryName(key) ?? 'Unknown',
    gateway: (key) => key?.split('.')[0] ?? 'Unknown',
    board: (key) => (key ? formatBoardName(key) : 'Unknown'),
  };
</script>

<script lang="ts">
  import { ChartBar, ChevronDown, RotateCcw, X } from '@lucide/svelte';
  import { cn } from '@openshock/svelte-core/utils';
  import { adminGetOnlineDevices } from '#lib/api/index.js';
  import { Container, PageHeader } from '@openshock/svelte-core/components';
  import DataTable from '#lib/components/Table/DataTableTemplate.svelte';
  import { Button } from '@openshock/svelte-core/components/ui/button';
  import { Input } from '@openshock/svelte-core/components/ui/input';
  import { Spinner } from '@openshock/svelte-core/components/ui/spinner';
  import { handleApiError } from '#lib/errorhandling/apiErrorHandling.js';
  import { SemVer } from 'semver';
  import { onMount } from 'svelte';
  import { registerBreadcrumbs } from '#lib/state/breadcrumbs-state.svelte.js';
  import { HIGH_LATENCY_MS, WEAK_RSSI_DBM, columns } from './columns';
  import DistributionChart, { bucketize } from './distribution-chart.svelte';
  import FacetFilter from './facet-filter.svelte';
  import { features } from './data-table-features';

  registerBreadcrumbs(() => [{ label: 'Online Hubs' }]);

  let data = $state<OnlineHub[]>([]);
  let hasLoaded = $state(false);
  let isFetching = $state(false);
  let search = $state('');
  let filters = $state<Record<Dimension, string[]>>({
    firmware: [],
    board: [],
    country: [],
    network: [],
    gateway: [],
  });
  let showBreakdown = $state(false);

  const dimensionKeys = Object.keys(dimensions) as Dimension[];

  let hasFilters = $derived(dimensionKeys.some((d) => filters[d].length > 0));

  function toggleFilter(dimension: Dimension, key: string) {
    const current = filters[dimension];
    filters[dimension] = current.includes(key)
      ? current.filter((k) => k !== key)
      : [...current, key];
  }

  function clearFilters() {
    for (const dimension of dimensionKeys) filters[dimension] = [];
  }

  function fetchOnlineHubs() {
    isFetching = true;
    adminGetOnlineDevices()
      .then((res) => {
        if (res.data) {
          data = res.data.map((x) => ({
            ...x,
            firmwareVersion: new SemVer(x.firmwareVersion),
            // int64 in the spec, so the client hands it over as a bigint; ASNs are 32-bit.
            network: x.asn === null ? null : { asn: Number(x.asn), org: x.asnOrg },
          }));
        }
      })
      .catch(handleApiError)
      .finally(() => {
        isFetching = false;
        hasLoaded = true;
      });
  }
  onMount(fetchOnlineHubs);

  // Values are OR'd within a dimension and the dimensions AND'd together.
  function matchesFilters(hub: OnlineHub, except?: Dimension) {
    return dimensionKeys.every((dimension) => {
      const keys = filters[dimension];
      if (dimension === except || keys.length === 0) return true;
      return keys.includes(dimensions[dimension].value(hub) ?? '');
    });
  }

  function matchesSearch(hub: OnlineHub, query: string) {
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
      hub.network && asnLabel(hub.network.asn),
      hub.network?.org,
      dimensions.board.value(hub),
    ].some((field) => field?.toLowerCase().includes(query));
  }

  let query = $derived(search.trim().toLowerCase());
  let searched = $derived(data.filter((hub) => matchesSearch(hub, query)));
  let filtered = $derived(searched.filter((hub) => matchesFilters(hub)));

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

  let labels = $derived(bucketLabels(data));

  // Each facet counts what picking a value would show, so its own selection is left out
  // of the filter; picks narrowed away by the other facets stay listed at zero.
  let facets = $derived(
    dimensionKeys.map((dimension) => {
      const hubs = searched.filter((hub) => matchesFilters(hub, dimension));
      const buckets = bucketize(hubs.map(dimensions[dimension].value), labels[dimension]);
      const missing = filters[dimension]
        .filter((key) => !buckets.some((b) => b.key === key))
        .map((key) => ({ key, name: labels[dimension](key || null), count: 0 }));
      return { dimension, title: dimensions[dimension].title, buckets: [...buckets, ...missing] };
    })
  );

  let charts = $derived(
    dimensionKeys.map((dimension) => ({
      dimension,
      title: dimensions[dimension].title,
      color: dimensions[dimension].color,
      buckets: bucketize(data.map(dimensions[dimension].value), labels[dimension]),
    }))
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
      <div class="flex flex-col gap-3">
        <div class="flex flex-wrap items-center gap-2">
          {#each facets as facet (facet.dimension)}
            <FacetFilter
              title={facet.title}
              buckets={facet.buckets}
              selected={filters[facet.dimension]}
              onChange={(selected) => (filters[facet.dimension] = selected)}
            />
          {/each}
          {#if hasFilters}
            <Button variant="ghost" size="sm" class="h-8" onclick={clearFilters}>
              Reset
              <X />
            </Button>
          {/if}
          <span class="text-muted-foreground ml-auto text-sm tabular-nums">
            {filtered.length} of {data.length}
          </span>
          <Button
            variant="outline"
            size="sm"
            class="h-8"
            aria-expanded={showBreakdown}
            onclick={() => (showBreakdown = !showBreakdown)}
          >
            <ChartBar />
            Breakdown
            <ChevronDown class={cn('transition-transform', showBreakdown && 'rotate-180')} />
          </Button>
        </div>

        {#if showBreakdown}
          <div class="grid grid-cols-1 gap-3 lg:grid-cols-2">
            {#each charts as chart (chart.dimension)}
              <DistributionChart
                title={chart.title}
                color={chart.color}
                buckets={chart.buckets}
                selected={filters[chart.dimension]}
                onSelect={(key) => toggleFilter(chart.dimension, key)}
              />
            {/each}
          </div>
        {/if}
      </div>

      <DataTable
        data={filtered}
        {columns}
        {features}
        mobileColumns={['name', 'owner']}
        class="min-h-80 w-full"
      />
    {:else}
      <div class="flex h-64 w-full items-center justify-center">
        <Spinner class="size-8 text-gray-600 dark:text-gray-300" />
      </div>
    {/if}
  </div>
</Container>

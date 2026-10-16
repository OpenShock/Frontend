<script lang="ts">
  import {
    type ControlStatsResponse,
    type ShockerControlStats,
    type UserControlStats,
    usersGetSelfControlStats,
  } from '#lib/api/index.js';
  import { Container, PageHeader } from '@openshock/svelte-core/components';
  import { Input } from '@openshock/svelte-core/components/ui/input';
  import * as Select from '@openshock/svelte-core/components/ui/select';
  import { Spinner } from '@openshock/svelte-core/components/ui/spinner';
  import * as Tabs from '@openshock/svelte-core/components/ui/tabs';
  import { handleApiError } from '#lib/errorhandling/apiErrorHandling.js';
  import { registerBreadcrumbs } from '#lib/state/breadcrumbs-state.svelte.js';
  import { createUrlFilters } from '#lib/utils/urlFilters.svelte.js';
  import BreakdownTable, { type BreakdownRow } from './breakdown-table.svelte';
  import DailyChart from './daily-chart.svelte';
  import TotalsCards from './totals-cards.svelte';

  registerBreadcrumbs(() => [
    { label: 'Shockers', href: 'shockers/own' },
    { label: 'Shocker Stats' },
  ]);

  const ranges = {
    '7d': { label: 'Last 7 days', days: 7 },
    '30d': { label: 'Last 30 days', days: 30 },
    '90d': { label: 'Last 90 days', days: 90 },
    '365d': { label: 'Last year', days: 365 },
    all: { label: 'All time', days: null },
    custom: { label: 'Custom range', days: null },
  } as const;
  type RangeKey = keyof typeof ranges;

  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const today = Temporal.Now.plainDateISO(timeZone);

  const filters = createUrlFilters({
    range: { type: 'string', default: '30d' },
    from: { type: 'string' },
    to: { type: 'string' },
  } as const);

  function parseDate(value: string | null | undefined): Temporal.PlainDate | undefined {
    if (!value) return undefined;
    try {
      return Temporal.PlainDate.from(value);
    } catch {
      return undefined;
    }
  }

  let range = $derived<RangeKey>(
    filters.range && filters.range in ranges ? (filters.range as RangeKey) : '30d'
  );

  let to = $derived(range === 'custom' ? (parseDate(filters.to) ?? today) : today);
  let from = $derived.by(() => {
    if (range === 'custom') return parseDate(filters.from);
    const days = ranges[range].days;
    return days === null ? undefined : today.subtract({ days: days - 1 });
  });

  function selectRange(value: string) {
    filters.range = value;
    if (value === 'custom') {
      filters.from ??= (from ?? today.subtract({ days: 29 })).toString();
      filters.to ??= to.toString();
    } else {
      filters.from = undefined;
      filters.to = undefined;
    }
  }

  let stats = $state<ControlStatsResponse | null>(null);
  let isFetching = $state(false);
  let tab = $state<'received' | 'given'>('received');

  // Monotonic token so only the most recently issued request applies its result.
  let fetchToken = 0;

  $effect(() => {
    const query = { tz: timeZone, from: from?.toString(), to: to.toString() };

    const token = ++fetchToken;
    isFetching = true;
    usersGetSelfControlStats({
      // The generated serializer drops Temporal values, so the dates are sent as ISO strings.
      querySerializer: () => {
        // eslint-disable-next-line svelte/prefer-svelte-reactivity
        const params = new URLSearchParams();
        for (const [key, value] of Object.entries(query)) {
          if (value !== undefined) params.set(key, value);
        }
        return params.toString();
      },
    })
      .then((res) => {
        if (token !== fetchToken) return;
        stats = res;
      })
      .catch((err) => {
        if (token !== fetchToken) return;
        handleApiError(err);
      })
      .finally(() => {
        if (token === fetchToken) isFetching = false;
      });
  });

  // All time has no lower bound, so the chart starts at the first day with activity.
  let chartFrom = $derived.by(() => {
    if (from) return from;
    const first = stats?.received.days
      .map((day) => day.date)
      .reduce<Temporal.PlainDate | undefined>(
        (min, date) => (!min || Temporal.PlainDate.compare(date, min) < 0 ? date : min),
        undefined
      );
    return first ?? to.subtract({ days: 29 });
  });

  function shockerRows(shockers: ShockerControlStats[]): BreakdownRow[] {
    return shockers.map((s) => ({
      key: s.shockerId ?? 'deleted',
      name: s.shockerName ?? 'Deleted shockers',
      muted: s.shockerId === null,
      stats: s.stats,
    }));
  }

  function userRows(users: UserControlStats[]): BreakdownRow[] {
    return users.map((u) => {
      if (u.userId === null) {
        return { key: 'guests', name: 'Guests (public shares)', muted: true, stats: u.stats };
      }
      return {
        key: u.userId,
        name: u.user?.name ?? 'Deleted user',
        muted: u.user === null,
        stats: u.stats,
      };
    });
  }
</script>

<Container>
  <PageHeader
    title="Shocker Stats"
    subtitle="How your shockers have been used, and how you used others'."
  >
    {#if isFetching}
      <Spinner />
    {/if}
  </PageHeader>

  <div class="flex w-full min-w-0 flex-col gap-6">
    <div class="flex flex-wrap items-end gap-2">
      <Select.Root type="single" value={range} onValueChange={selectRange}>
        <Select.Trigger class="w-44">{ranges[range].label}</Select.Trigger>
        <Select.Content>
          {#each Object.entries(ranges) as [key, option] (key)}
            <Select.Item value={key} label={option.label}>{option.label}</Select.Item>
          {/each}
        </Select.Content>
      </Select.Root>
      {#if range === 'custom'}
        <Input
          type="date"
          class="w-40"
          aria-label="From"
          max={filters.to ?? today.toString()}
          bind:value={() => filters.from ?? '', (v) => (filters.from = v || undefined)}
        />
        <span class="text-muted-foreground self-center text-sm">to</span>
        <Input
          type="date"
          class="w-40"
          aria-label="To"
          min={filters.from}
          max={today.toString()}
          bind:value={() => filters.to ?? '', (v) => (filters.to = v || undefined)}
        />
      {/if}
    </div>

    {#if stats}
      <Tabs.Root bind:value={tab}>
        <Tabs.List>
          <Tabs.Trigger value="received">Received</Tabs.Trigger>
          <Tabs.Trigger value="given">Given</Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="received" class="flex flex-col gap-6 pt-4">
          <TotalsCards totals={stats.received.totals} />
          <DailyChart days={stats.received.days} from={chartFrom} {to} />
          <div class="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <BreakdownTable
              title="By shocker"
              nameHeader="Shocker"
              rows={shockerRows(stats.received.shockers)}
              emptyText="None of your shockers were controlled in this period."
            />
            <BreakdownTable
              title="By controller"
              nameHeader="User"
              rows={userRows(stats.received.controllers)}
              emptyText="Nobody controlled your shockers in this period."
            />
          </div>
        </Tabs.Content>

        <Tabs.Content value="given" class="flex flex-col gap-6 pt-4">
          <TotalsCards totals={stats.given.totals} />
          <BreakdownTable
            title="By owner"
            nameHeader="Owner"
            rows={userRows(stats.given.owners)}
            emptyText="You did not control any shockers in this period."
          />
        </Tabs.Content>
      </Tabs.Root>
    {:else if isFetching}
      <div class="flex justify-center py-12"><Spinner /></div>
    {/if}
  </div>
</Container>

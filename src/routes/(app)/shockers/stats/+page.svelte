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
  import { m } from '#lib/paraglide/messages.js';
  import { registerBreadcrumbs } from '#lib/state/breadcrumbs-state.svelte.js';
  import { createUrlFilters } from '#lib/utils/urlFilters.svelte.js';
  import BreakdownTable, { type BreakdownRow } from './breakdown-table.svelte';
  import DailyChart from './daily-chart.svelte';
  import TotalsCards from './totals-cards.svelte';

  registerBreadcrumbs(() => [
    { label: m.shockers_title(), href: 'shockers/own' },
    { label: m.shocker_stats_title() },
  ]);

  const ranges = {
    '7d': { label: m.shocker_stats_range_7d, days: 7 },
    '30d': { label: m.shocker_stats_range_30d, days: 30 },
    '90d': { label: m.shocker_stats_range_90d, days: 90 },
    '365d': { label: m.shocker_stats_range_365d, days: 365 },
    all: { label: m.shocker_stats_range_all, days: null },
    custom: { label: m.shocker_stats_range_custom, days: null },
  } as const;
  type RangeKey = keyof typeof ranges;

  const browserTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  // Falls back to UTC when the server's time zone database does not know the browser's zone.
  let timeZone = $state(browserTimeZone);
  let today = $state(Temporal.Now.plainDateISO(browserTimeZone));

  function refreshToday() {
    const current = Temporal.Now.plainDateISO(timeZone);
    // Only on an actual change, every new value refetches the stats.
    if (!current.equals(today)) today = current;
  }

  // Keeps `today` current when the page stays open past midnight, so presets include the new day.
  // Reading `today` re-arms the timer each time it moves on.
  $effect(() => {
    refreshToday();
    const now = Temporal.Now.zonedDateTimeISO(timeZone);
    const nextMidnight = today.add({ days: 1 }).toZonedDateTime(timeZone);
    // A second of slack so the timer never fires just before midnight.
    const timer = setTimeout(refreshToday, now.until(nextMidnight).total('milliseconds') + 1000);
    return () => clearTimeout(timer);
  });

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
    // Own keys only, `in` would also accept inherited names such as `toString`.
    filters.range && Object.hasOwn(ranges, filters.range) ? (filters.range as RangeKey) : '30d'
  );

  let selectedTo = $derived(range === 'custom' ? (parseDate(filters.to) ?? today) : today);
  let selectedFrom = $derived.by(() => {
    if (range === 'custom') return parseDate(filters.from);
    const days = ranges[range].days;
    return days === null ? undefined : today.subtract({ days: days - 1 });
  });
  // The API rejects a reversed range, which a hand-edited URL can still produce.
  let reversed = $derived(
    selectedFrom !== undefined && Temporal.PlainDate.compare(selectedFrom, selectedTo) > 0
  );
  let from = $derived(reversed ? selectedTo : selectedFrom);
  let to = $derived(reversed && selectedFrom ? selectedFrom : selectedTo);

  function selectRange(value: string) {
    // Read before switching, `from` and `to` follow the new range as soon as it is set.
    const previousFrom = from;
    const previousTo = to;
    filters.range = value;
    if (value === 'custom') {
      filters.from ??= (previousFrom ?? today.subtract({ days: 29 })).toString();
      filters.to ??= previousTo.toString();
    } else {
      filters.from = undefined;
      filters.to = undefined;
    }
  }

  let stats = $state<ControlStatsResponse | null>(null);
  let isFetching = $state(false);
  let loadFailed = $state(false);
  let tab = $state<'received' | 'given'>('received');

  // Monotonic token so only the most recently issued request applies its result.
  let fetchToken = 0;

  $effect(() => {
    const query = { tz: timeZone, from, to };

    const token = ++fetchToken;
    isFetching = true;
    loadFailed = false;
    usersGetSelfControlStats({
      query,
      // The generated serializer drops Temporal values, so the dates are sent as ISO strings.
      querySerializer: (params) => {
        // eslint-disable-next-line svelte/prefer-svelte-reactivity
        const search = new URLSearchParams();
        for (const [key, value] of Object.entries(params)) {
          if (value !== undefined) search.set(key, String(value));
        }
        return search.toString();
      },
    })
      .then((res) => {
        if (token !== fetchToken) return;
        stats = res;
      })
      .catch((err) => {
        if (token !== fetchToken) return;
        stats = null;
        loadFailed = true;
        return handleApiError(err, {
          'ControlStats.InvalidTimeZone': () => {
            if (timeZone === 'UTC') return false;
            // Retried by the effect, since the time zone is part of the query.
            loadFailed = false;
            timeZone = 'UTC';
          },
        });
      })
      .finally(() => {
        if (token === fetchToken) isFetching = false;
      });
  });

  // All time has no lower bound, so the chart starts at the first day with activity.
  // Wide custom ranges do the same, so a start like 0001-01-01 doesn't chart centuries of empty days.
  let chartFrom = $derived.by(() => {
    if (from && from.until(to).days < 366) return from;
    const first = stats?.received.days
      .map((day) => day.date)
      .reduce<Temporal.PlainDate | undefined>(
        (min, date) => (!min || Temporal.PlainDate.compare(date, min) < 0 ? date : min),
        undefined
      );
    if (!first) return to.subtract({ days: 29 });
    return from && Temporal.PlainDate.compare(from, first) > 0 ? from : first;
  });

  function shockerRows(shockers: ShockerControlStats[]): BreakdownRow[] {
    return shockers.map((s) => ({
      key: s.shockerId ?? 'deleted',
      name: s.shockerName ?? m.shocker_stats_deleted_shockers(),
      muted: s.shockerId === null,
      stats: s.stats,
    }));
  }

  function userRows(users: UserControlStats[]): BreakdownRow[] {
    return users.map((u) => {
      if (u.userId === null) {
        return { key: 'guests', name: m.shocker_stats_guests(), muted: true, stats: u.stats };
      }
      return {
        key: u.userId,
        name: u.user?.name ?? m.shocker_stats_deleted_user(),
        muted: u.user === null,
        stats: u.stats,
      };
    });
  }
</script>

<Container>
  <PageHeader title={m.shocker_stats_title()} subtitle={m.shocker_stats_subtitle()}>
    {#if isFetching}
      <Spinner />
    {/if}
  </PageHeader>

  <div class="flex w-full min-w-0 flex-col gap-6">
    <div class="flex flex-wrap items-end gap-2">
      <Select.Root type="single" value={range} onValueChange={selectRange}>
        <Select.Trigger class="w-44">{ranges[range].label()}</Select.Trigger>
        <Select.Content>
          {#each Object.entries(ranges) as [key, option] (key)}
            <Select.Item value={key} label={option.label()}>{option.label()}</Select.Item>
          {/each}
        </Select.Content>
      </Select.Root>
      {#if range === 'custom'}
        <Input
          type="date"
          class="w-40"
          aria-label={m.shocker_stats_from_label()}
          max={filters.to ?? today.toString()}
          bind:value={() => filters.from ?? '', (v) => (filters.from = v || undefined)}
        />
        <span class="text-muted-foreground self-center text-sm"
          >{m.shocker_stats_range_separator()}</span
        >
        <Input
          type="date"
          class="w-40"
          aria-label={m.shocker_stats_to_label()}
          min={filters.from}
          max={today.toString()}
          bind:value={() => filters.to ?? '', (v) => (filters.to = v || undefined)}
        />
      {/if}
    </div>

    {#if timeZone !== browserTimeZone}
      <p class="text-muted-foreground text-sm">
        {m.shocker_stats_utc_fallback({ timeZone: browserTimeZone })}
      </p>
    {/if}

    {#if stats}
      <Tabs.Root
        bind:value={tab}
        aria-busy={isFetching}
        class={['transition-opacity', isFetching && 'opacity-60']}
      >
        <Tabs.List>
          <Tabs.Trigger value="received">{m.shocker_stats_tab_received()}</Tabs.Trigger>
          <Tabs.Trigger value="given">{m.shocker_stats_tab_given()}</Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="received" class="flex flex-col gap-6 pt-4">
          <TotalsCards totals={stats.received.totals} />
          <DailyChart days={stats.received.days} from={chartFrom} {to} />
          <div class="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <BreakdownTable
              title={m.shocker_stats_by_shocker()}
              nameHeader={m.shocker_label()}
              rows={shockerRows(stats.received.shockers)}
              emptyText={m.shocker_stats_empty_shockers()}
            />
            <BreakdownTable
              title={m.shocker_stats_by_controller()}
              nameHeader={m.shocker_stats_col_user()}
              rows={userRows(stats.received.controllers)}
              emptyText={m.shocker_stats_empty_controllers()}
            />
          </div>
        </Tabs.Content>

        <Tabs.Content value="given" class="flex flex-col gap-6 pt-4">
          <TotalsCards totals={stats.given.totals} />
          <BreakdownTable
            title={m.shocker_stats_by_owner()}
            nameHeader={m.shocker_stats_col_owner()}
            rows={userRows(stats.given.owners)}
            emptyText={m.shocker_stats_empty_owners()}
          />
        </Tabs.Content>
      </Tabs.Root>
    {:else if isFetching}
      <div class="flex justify-center py-12"><Spinner /></div>
    {:else if loadFailed}
      <p class="text-muted-foreground py-12 text-center text-sm">{m.shocker_stats_load_failed()}</p>
    {/if}
  </div>
</Container>

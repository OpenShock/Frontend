<script lang="ts">
  import RotateCcw from '@lucide/svelte/icons/rotate-ccw';
  import type { ColumnFiltersState, SortingState } from '@tanstack/table-core';
  import { adminGetOnlineDevices } from '$lib/api';
  import { Container } from '@openshock/svelte-core/components';
  import DataTable from '$lib/components/Table/DataTableTemplate.svelte';
  import { Button } from '@openshock/svelte-core/ui/button';
  import * as Card from '@openshock/svelte-core/ui/card';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
  import { SemVer } from 'semver';
  import { onMount } from 'svelte';
  import { registerBreadcrumbs } from '$lib/state/breadcrumbs-state.svelte';
  import { type OnlineHub, columns } from './columns';

  registerBreadcrumbs(() => [{ label: 'Online Hubs' }]);

  let data = $state<OnlineHub[]>([]);
  let sorting = $state<SortingState>([]);
  let filters = $state<ColumnFiltersState>([]);

  function fetchOnlineHubs() {
    adminGetOnlineDevices()
      .then((res) => {
        if (res.data) {
          data = res.data.map((x) => ({ ...x, firmwareVersion: new SemVer(x.firmwareVersion) }));
        }
      })
      .catch(handleApiError);
  }
  onMount(fetchOnlineHubs);
</script>

<Container>
  <Card.Header>
    <Card.Title class="flex items-center justify-between space-x-2 text-3xl">
      Online Hubs: {data.length}
      <Button class="text-xl" onclick={fetchOnlineHubs}>
        <RotateCcw />
        <span> Refresh </span>
      </Button>
    </Card.Title>
  </Card.Header>
  <Card.Content>
    <DataTable {data} {columns} {sorting} {filters} />
  </Card.Content>
</Container>

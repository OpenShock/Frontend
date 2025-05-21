<script lang="ts">
  import { adminApi } from '$lib/api';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
  import { Button } from '$lib/components/ui/button';
  import * as Card from '$lib/components/ui/card';
  import { SemVer } from 'semver';
  import { onMount } from 'svelte';
  import { columns, type OnlineHub } from './columns';
  import DataTable from '$lib/components/Table/DataTableTemplate.svelte';
  import type { ColumnFiltersState, SortingState } from '@tanstack/table-core';

  import RotateCcw from '@lucide/svelte/icons/rotate-ccw';

  let data = $state<OnlineHub[]>([]);
  let sorting = $state<SortingState>([]);
  let filters = $state<ColumnFiltersState>([]);

  function fetchOnlineHubs() {
    adminApi
      .adminGetOnlineDevices()
      .then((res) => {
        if (res.data) {
          data = res.data.map((x) => ({ ...x, firmwareVersion: new SemVer(x.firmwareVersion) }));
        }
      })
      .catch(handleApiError);
  }
  onMount(fetchOnlineHubs);
</script>

<div class="my-8">
  <Card.Header>
    <Card.Title class="flex items-center justify-between space-x-2 text-3xl">
      Online Hubs: {data.length}
      <Button class="btn variant-filled-primary text-xl" onclick={fetchOnlineHubs}>
        <RotateCcw />
        <span> Refresh </span>
      </Button>
    </Card.Title>
  </Card.Header>
  <Card.Content>
    <DataTable {data} {columns} {sorting} {filters} />
  </Card.Content>
</div>

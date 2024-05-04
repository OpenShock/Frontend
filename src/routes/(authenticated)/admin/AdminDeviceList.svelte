<script lang="ts">
  import { DataHandler } from '@vincjo/datatables';
  import Pagination from '$lib/components/table/Pagination.svelte';
  import RowCount from '$lib/components/table/RowCount.svelte';
  import RowsPerPage from '$lib/components/table/RowsPerPage.svelte';
  import Search from '$lib/components/table/Search.svelte';
  import ThFilter from '$lib/components/table/ThFilter.svelte';
  import ThSort from '$lib/components/table/ThSort.svelte';
  import type { AdminOnlineDeviceResponse } from '$lib/api/internal/v1';

  type FlatDevice = AdminOnlineDeviceResponse & { ownerName: string | null | undefined };

  export let devices: FlatDevice[];

  function formatInterval(unit: string, interval: number) {
    interval = Math.floor(interval);
    return interval + ' ' + unit + (interval > 1 ? 's' : '');
  }
  function timeSince(unix: number) {
    let seconds = Math.floor(unix / 1000);

    let interval = seconds / 31536000;
    if (interval > 1) return formatInterval('year', interval);

    interval = seconds / 2592000;
    if (interval > 1) return formatInterval('month', interval);

    interval = seconds / 86400;
    if (interval > 1) return formatInterval('day', interval);

    interval = seconds / 3600;
    if (interval > 1) return formatInterval('hour', interval);

    interval = seconds / 60;
    if (interval > 1) return formatInterval('minute', interval);

    return formatInterval('second', seconds);
  }

  let since: number = Date.now();
  setInterval(() => {
    since = Date.now();
  }, 1000);

  const handler = new DataHandler(devices, { rowsPerPage: 10 });
  const rows = handler.getRows();
</script>

<div class="overflow-x-auto space-y-2">
  <header class="flex justify-between gap-4">
    <Search {handler} />
    <RowsPerPage {handler} />
  </header>
  <table class="table table-hover table-compact table-auto w-full">
    <thead>
      <tr>
        <ThSort {handler} orderBy="id">Device ID</ThSort>
        <ThSort {handler} orderBy="name">Device Name</ThSort>
        <ThSort {handler} orderBy="firmwareVersion">Firmware Version</ThSort>
        <ThSort {handler} orderBy="uptime">Uptime</ThSort>
        <ThSort {handler} orderBy="gateway">Gateway</ThSort>
        <ThSort {handler} orderBy="ownerName">Owner</ThSort>
      </tr>
      <tr>
        <ThFilter {handler} filterBy="id" />
        <ThFilter {handler} filterBy="name" />
        <ThFilter {handler} filterBy="firmwareVersion" />
        <ThFilter {handler} filterBy="uptime" />
        <ThFilter {handler} filterBy="gateway" />
        <ThFilter {handler} filterBy="ownerName" />
      </tr>
    </thead>
    <tbody>
      {#each $rows as row (row.id)}
        <tr>
          <td>{row.id}</td>
          <td>{row.name}</td>
          <td class={row.firmwareVersion ? '' : 'text-red-500'}>{row.firmwareVersion}</td>
          <td title={row.connectedAt?.toString() ?? 'N/A'}>
            {row.connectedAt ? timeSince(since - row.connectedAt.getTime()) : 'N/A'}
          </td>
          <td class={row.gateway ? '' : 'text-red-500'}>{row.gateway}</td>
          <td class="flex items-center space-x-2">
            <img class="h-8 rounded-full" src={row.owner?.image} alt="User Avatar" />
            <p>{row.ownerName}</p>
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
  <footer class="flex justify-between">
    <RowCount {handler} />
    <Pagination {handler} />
  </footer>
</div>

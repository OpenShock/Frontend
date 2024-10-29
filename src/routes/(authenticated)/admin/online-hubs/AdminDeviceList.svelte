<script lang="ts">
  import { TableHandler, Datatable, ThSort, ThFilter } from '@vincjo/datatables';
  import type { AdminOnlineDeviceResponse } from '$lib/api/internal/v1';
  import { durationToString } from '$lib/utils/time';

  type FlatDevice = AdminOnlineDeviceResponse & { ownerName: string | null | undefined };

  interface Props {
    devices: FlatDevice[];
  }

  let { devices }: Props = $props();

  let since: number = $state(Date.now());
  setInterval(() => {
    since = Date.now();
  }, 1000);

  const table = new TableHandler(devices, { rowsPerPage: 10 });
</script>

<div class="overflow-x-auto space-y-2">
  <Datatable basic {table}>
    <table>
      <thead>
        <tr>
          <ThSort {table} field="id">Device ID</ThSort>
          <ThSort {table} field="name">Device Name</ThSort>
          <ThSort {table} field="firmwareVersion">Firmware Version</ThSort>
          <ThSort {table} field="uptime">Uptime</ThSort>
          <ThSort {table} field="gateway">Gateway</ThSort>
          <ThSort {table} field="ownerName">Owner</ThSort>
        </tr>
        <tr>
          <ThFilter {table} field="id" />
          <ThFilter {table} field="name" />
          <ThFilter {table} field="firmwareVersion" />
          <ThFilter {table} field="uptime" />
          <ThFilter {table} field="gateway" />
          <ThFilter {table} field="ownerName" />
        </tr>
      </thead>
      <tbody>
        {#each table.rows as row}
          <tr>
            <td>{row.id}</td>
            <td>{row.name}</td>
            <td class={row.firmwareVersion ? '' : 'text-red-500'}>{row.firmwareVersion}</td>
            <td title={row.connectedAt?.toString() ?? 'N/A'}>
              {row.connectedAt ? durationToString(since - row.connectedAt.getTime()) : 'N/A'}
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
  </Datatable>
</div>

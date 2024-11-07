<script lang="ts">
  import type { AdminOnlineDeviceResponse } from '$lib/api/internal/v1';
  import { onDestroy, onMount } from 'svelte';
  import { SemVer } from 'semver';
  import { adminApi } from '$lib/api';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
  import { columns, type OnlineDevice, type OnlineDeviceOwner } from './columns';
  import DataTable from './data-table.svelte';

  function apiDeviceToTableDevice(device: AdminOnlineDeviceResponse): OnlineDevice {
    return {
      id: device.id,
      name: device.name,
      owner: {
        id: device.owner.id,
        name: device.owner.name,
        image: device.owner.image,
      },
      firmware_version: new SemVer(device.firmwareVersion),
      gateway: device.gateway,
      connected_at: device.connectedAt,
      user_agent: device.userAgent,
      booted_at: device.uptime ? new Date(Date.now() - Number(device.uptime)) : null,
      latency: device.latency ? Number(device.latency) : null,
    };
  }

  let data = $state<OnlineDevice[]>([]);

  function fetchOnlineDevices() {
    adminApi
      .adminGetOnlineDevices()
      .then((res) => {
        if (res.data) {
          data = res.data.map(apiDeviceToTableDevice);
        }
      })
      .catch(handleApiError);
  }

  let interval: ReturnType<typeof setInterval>;
  onMount(() => {
    fetchOnlineDevices();
    // Update timestamps every 5 seconds
    interval = setInterval(() => {
      data = Object.assign([], data);
    }, 5000);
  });
  onDestroy(() => {
    clearInterval(interval);
  });
</script>

<div class="flex justify-between w-full mb-2">
  <h2 class="text-3xl">Online Hubs</h2>
  <button class="btn variant-filled-primary text-xl" onclick={fetchOnlineDevices}>
    <i class="fa fa-sync"></i>
    Refresh
  </button>
</div>

{#if data}
  <DataTable {data} {columns} />
{/if}

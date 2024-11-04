<script lang="ts">
  import type { AdminOnlineDeviceResponse } from '$lib/api/internal/v1';
  import { onDestroy, onMount } from 'svelte';
  import { SemVer } from 'semver';
  import { adminApi } from '$lib/api';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
  import { columns, type OnlineDevice, type OnlineDeviceOwner } from './columns';
  import DataTable from './data-table.svelte';

  function apiDeviceToTableDevice(device: AdminOnlineDeviceResponse): OnlineDevice {
    let owner: OnlineDeviceOwner;
    if (device.owner) {
      owner = {
        id: device.owner.id,
        name: device.owner.name ?? 'Unknown',
        image: device.owner.image ?? 'https://openshock.app/someimageurl',
      };
    } else {
      owner = {
        id: 'Unknown',
        name: 'Unknown',
        image: 'https://openshock.app/someimageurl',
      };
    }

    let firmware_version: SemVer | null;
    if (device.firmwareVersion) {
      firmware_version = new SemVer(device.firmwareVersion);
    } else {
      firmware_version = null;
    }

    return {
      id: device.id,
      name: device.name ?? 'Unknown',
      owner,
      firmware_version,
      gateway: device.gateway ?? 'Unknown',
      connected_at: device.connectedAt,
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

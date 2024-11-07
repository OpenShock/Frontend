<script lang="ts">
  import { adminApi } from '$lib/api';
  import type { AdminOnlineDeviceResponse } from '$lib/api/internal/v1';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
  import { SemVer } from 'semver';
  import { onDestroy, onMount } from 'svelte';
  import { columns, type OnlineHub } from './columns';
  import DataTable from './data-table.svelte';

  function apiHubToTableHub(hub: AdminOnlineDeviceResponse): OnlineHub {
    return {
      id: hub.id,
      name: hub.name,
      owner: {
        id: hub.owner.id,
        name: hub.owner.name,
        image: hub.owner.image,
      },
      firmware_version: new SemVer(hub.firmwareVersion),
      gateway: hub.gateway,
      connected_at: hub.connectedAt,
      user_agent: hub.userAgent,
      booted_at: hub.uptime ? new Date(Date.now() - Number(hub.uptime)) : null,
      latency: hub.latency ? Number(hub.latency) : null,
    };
  }

  let data = $state<OnlineHub[]>([]);

  function fetchOnlineHubs() {
    adminApi
      .adminGetOnlineDevices()
      .then((res) => {
        if (res.data) {
          data = res.data.map(apiHubToTableHub);
        }
      })
      .catch(handleApiError);
  }

  let interval: ReturnType<typeof setInterval>;
  onMount(() => {
    fetchOnlineHubs();
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
  <h2 class="text-3xl">Online Hubs: {data.length}</h2>
  <button class="btn variant-filled-primary text-xl" onclick={fetchOnlineHubs}>
    <i class="fa fa-sync"></i>
    Refresh
  </button>
</div>

{#if data}
  <DataTable {data} {columns} />
{/if}

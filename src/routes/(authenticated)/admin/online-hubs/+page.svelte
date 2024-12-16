<script lang="ts">
  import { adminApi } from '$lib/api';
  import type { AdminOnlineDeviceResponse } from '$lib/api/internal/v1';
  import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
  import { Button } from '$lib/components/ui/button';
  import * as Card from '$lib/components/ui/card';
  import { SemVer } from 'semver';
  import { onDestroy, onMount } from 'svelte';
  import { columns, type OnlineHub } from './columns';
  import DataTable from './data-table.svelte';

  import RotateCcw from 'lucide-svelte/icons/rotate-ccw';

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
      booted_at: hub.bootedAt,
      latency: hub.latencyMs,
      rssi: hub.rssi,
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

<div class="container my-8">
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
    <DataTable {data} {columns} />
  </Card.Content>
</div>

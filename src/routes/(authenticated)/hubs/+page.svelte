<script lang="ts">
  import Button from '$lib/components/ui/button/button.svelte';
  import * as Card from '$lib/components/ui/card';
  import { OwnDevicesStore, OnlineDevicesStore } from '$lib/stores/DevicesStore';
  import { SemVer } from 'semver';
  import { columns, type Hub } from './columns';
  import DataTable from './data-table.svelte';

  import RotateCcw from 'lucide-svelte/icons/rotate-ccw';

  let data = $derived.by<Hub[]>(() => {
    if (!$OwnDevicesStore || !$OnlineDevicesStore) return [];

    return Array.from($OwnDevicesStore).map(([,device]) => {
      const onlineState = $OnlineDevicesStore.get(device.id);
      return {
        id: device.id,
        name: device.name,
        is_online: onlineState?.online ?? false,
        firmware_version: onlineState?.firmwareVersion ? new SemVer(onlineState.firmwareVersion) : null,
        shockers: device.shockers.map((shocker) => {
          return {
            id: shocker.id,
            rf_id: shocker.rfId,
            model: shocker.model,
            name: shocker.name,
            is_paused: shocker.isPaused,
            created_at: shocker.createdOn,
          };
        }),
        created_at: device.createdOn,
      };
    });
  });
</script>

<div class="container my-8">
  <Card.Header>
    <Card.Title class="text-3xl flex items-center space-x-2 justify-between">
      Hubs
      <Button class="btn variant-filled-primary text-xl" onclick={() => {}}>
        <RotateCcw />
        <span> Refresh </span>
      </Button>
    </Card.Title>
    <Card.Description>This is a list of all hubs you own.</Card.Description>
  </Card.Header>
  <Card.Content>
    <DataTable {data} {columns} />
  </Card.Content>
</div>
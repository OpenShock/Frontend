<script lang="ts">
  import Button from '$lib/components/ui/button/button.svelte';
  import * as Card from '$lib/components/ui/card';
  import { OwnDeviceStatesStore, OwnDevicesStore } from '$lib/stores/DevicesStore';
  import { SemVer } from 'semver';
  import { columns, type Hub } from './columns';
  import DataTable from './data-table.svelte';

  import RotateCcw from 'lucide-svelte/icons/rotate-ccw';

  let data = $derived.by<Hub[]>(() => {
    if (!$OwnDeviceStatesStore || !$OwnDevicesStore) return [];

    const deviceStates = $OwnDeviceStatesStore.map((state) => ({
      id: state.device,
      online: state.online,
      firmwareVersion: state.firmwareVersion,
    }));

    return $OwnDevicesStore.map((device) => {
      const state = deviceStates.find((state) => state.id === device.id);
      return {
        id: device.id,
        name: device.name,
        is_online: state?.online ?? false,
        firmware_version: state?.firmwareVersion ? new SemVer(state.firmwareVersion) : null,
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

<Card.Root>
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
</Card.Root>

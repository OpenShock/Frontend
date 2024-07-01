<script lang="ts">
  import { OwnDeviceStatesStore, OwnDevicesStore } from '$lib/stores/DevicesStore';

  interface Device {
    id: string;
    name: string | null;
    isOnline: boolean;
    firmwareVersion: string | null;
    createdAt: Date;
  }

  let devices: Device[] = [];

  $: if ($OwnDevicesStore != null) {
    const deviceStates = $OwnDeviceStatesStore?.map((state) => ({
      id: state.device,
      online: state.online,
      firmwareVersion: state.firmwareVersion,
    }));

    devices = $OwnDevicesStore.map((device) => {
      const state = deviceStates?.find((state) => state.id === device.id);
      return {
        id: device.id,
        name: device.name,
        isOnline: state?.online ?? false,
        firmwareVersion: state?.firmwareVersion ?? null,
        createdAt: device.createdOn,
      };
    });
  }
</script>

<div class="container h-full mx-auto flex justify-center items-center">
  {#each devices as device (device.id)}
    <div class="bg-white shadow-md rounded-lg p-6 m-4 w-64">
      <h3 class="text-lg font-semibold text-black">{device.name ?? 'Unnamed device'}</h3>
      <p class="text-sm text-gray-500">{device.isOnline ? 'Online' : 'Offline'}</p>
      <p class="text-sm text-gray-500">{device.firmwareVersion ?? 'Unknown firmware version'}</p>
      <p class="text-sm text-gray-500">Created on {device.createdAt.toLocaleDateString()}</p>
    </div>
  {/each}
</div>

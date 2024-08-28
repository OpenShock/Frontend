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

<div class="container h-full mx-auto flex flex-col justify-center items-center">
  <table class="table-container border-collapse max-w-4xl">
    <thead>
      <tr>
        <th class="text-left">Device Name</th>
        <th class="text-left">Status</th>
        <th class="text-left">Version</th>
        <th class="text-left">Created On</th>
      </tr>
    </thead>
    <tbody>
      {#each devices as device (device.id)}
        <tr>
          <td class="text-lg border-y">
            {device.name ?? 'Unnamed device'}
          </td>
          <td class="border-y">
            {#if device.isOnline}
              <span class="text-green-500">Online</span>
            {:else}
              <span class="text-red-500">Offline</span>
            {/if}
            {#if device.firmwareVersion}
              <button class="btn variant-filled">
                  Update Firmware
              </button>
            {/if}
          </td>
          <td class="border-y">
            {#if device.firmwareVersion}
              <span class="text-gray-500">Version {device.firmwareVersion}</span>
            {/if}
          </td>
          <td class="border-y">
            {device.createdAt.toLocaleDateString()}
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>

<style>
  table td {
    padding: 0.5rem 0.25rem;
  }
</style>
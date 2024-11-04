<script lang="ts">
  import Button, { buttonVariants } from '$lib/components/ui/button/button.svelte';
  import { OwnDeviceStatesStore, OwnDevicesStore } from '$lib/stores/DevicesStore';

  import CircleFadingArrowUp from 'lucide-svelte/icons/circle-fading-arrow-up';
  import Pencil from 'lucide-svelte/icons/pencil';
  import Trash from 'lucide-svelte/icons/trash';

  interface Device {
    id: string;
    name: string | null;
    isOnline: boolean;
    firmwareVersion: string | null;
    createdAt: Date;
  }

  let devices: Device[] = $state([]);

  $effect(() => {
    if (!$OwnDevicesStore) return;

    const deviceStates = $OwnDeviceStatesStore?.map((state) => ({
      id: state.device,
      online: state.online,
      firmwareVersion: state.firmwareVersion,
    }));

    if (!deviceStates) return;

    devices = $OwnDevicesStore.map((device) => {
      const state = deviceStates.find((state) => state.id === device.id);
      return {
        id: device.id,
        name: device.name,
        isOnline: state?.online ?? false,
        firmwareVersion: state?.firmwareVersion ?? null,
        createdAt: device.createdOn,
      };
    });
  });
</script>

<table class="table-container border-collapse">
  <thead>
    <tr>
      <th class="text-left">Device Name</th>
      <th class="text-left">Status</th>
      <th class="text-left">Version</th>
      <th class="text-left">Created On</th>
      <th class="text-center">Actions</th>
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
        </td>
        <td class="border-y">
          {#if device.firmwareVersion}
            <span>{device.firmwareVersion}</span>
          {/if}
        </td>
        <td class="border-y">
          {device.createdAt.toLocaleDateString()}
        </td>
        <td>
          <Button
            class={buttonVariants({ variant: 'secondary' })}
            disabled={!device.firmwareVersion}><CircleFadingArrowUp /></Button
          >
          <Button class={buttonVariants({ variant: 'secondary' })}><Pencil /></Button>
          <Button class={buttonVariants({ variant: 'destructive' })}><Trash /></Button>
        </td>
      </tr>
    {/each}
  </tbody>
</table>

<style>
  table td {
    padding: 0.5rem 0.25rem;
  }
</style>

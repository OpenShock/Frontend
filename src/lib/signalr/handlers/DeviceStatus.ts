import { isDeviceOnlineState } from '$lib/signalr/models/DeviceOnlineState';
import { onlineHubs } from '$lib/stores/HubsStore.svelte';
import { toast } from 'svelte-sonner';

export function handleSignalrDeviceStatus(array: unknown) {
  if (!Array.isArray(array) || !array.every(isDeviceOnlineState)) {
    console.error('Received invalid SignalR DeviceStatus event', array);
    toast.error('Received invalid update from server!');
    return;
  }

  for (const entry of array) {
    const existing = onlineHubs.get(entry.device);
    onlineHubs.set(entry.device, {
      hubId: entry.device,
      isOnline: entry.online,
      firmwareVersion: entry.firmwareVersion,
      otaInstall: existing?.otaInstall ?? null,
      otaResult: existing?.otaResult ?? null,
    });
  }
}

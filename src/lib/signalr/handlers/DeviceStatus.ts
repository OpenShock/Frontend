import { isDeviceOnlineState } from '$lib/signalr/models/DeviceOnlineState';
import { HubOnlineState, onlineHubs } from '$lib/stores/HubsStore.svelte';
import { toast } from 'svelte-sonner';

export function handleSignalrDeviceStatus(array: unknown) {
  if (!Array.isArray(array) || !array.every(isDeviceOnlineState)) {
    console.error('Received invalid SignalR DeviceStatus event', array);
    toast.error('Received invalid update from server!');
    return;
  }

  for (const entry of array) {
    const existing = onlineHubs.get(entry.device);
    if (existing) {
      existing.isOnline = entry.online;
      existing.firmwareVersion = entry.firmwareVersion;
    } else {
      onlineHubs.set(entry.device, new HubOnlineState(entry.device, entry.online, entry.firmwareVersion));
    }
  }
}

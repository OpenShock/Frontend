import { isDeviceOnlineState } from '$lib/signalr/models/DeviceOnlineState';
import { OnlineHubsStore } from '$lib/stores/HubsStore';
import { toast } from 'svelte-sonner';

export function handleSignalrDeviceStatus(array: unknown) {
  if (!Array.isArray(array) || !array.every(isDeviceOnlineState)) {
    console.error('Received invalid SignalR DeviceStatus event', array);
    toast.error('Received invalid update from server!');
    return;
  }

  OnlineHubsStore.update((state) => {
    array.forEach((entry) => {
      state.set(entry.device, {
        hubId: entry.device,
        isOnline: entry.online,
        firmwareVersion: entry.firmwareVersion,
        otaInstall: null,
      });
    });

    return state;
  });
}

import { OnlineHubsStore } from '$lib/stores/HubsStore';
import { isObject } from '$lib/typeguards';
import { toast } from 'svelte-sonner';

interface DeviceOnlineState {
  device: string;
  online: boolean;
  firmwareVersion: string | null;
}

function isDeviceOnlineState(value: unknown): value is DeviceOnlineState {
  return (
    isObject(value) &&
    'device' in value &&
    'online' in value &&
    'firmwareVersion' in value &&
    typeof value.device === 'string' &&
    typeof value.online === 'boolean' &&
    (typeof value.firmwareVersion === 'string' || value.firmwareVersion === null)
  );
}

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

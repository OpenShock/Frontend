import { OnlineHubsStore } from '$lib/stores/HubsStore';
import { toast } from 'svelte-sonner';

type SignalrHub = {
  device: string;
  online: boolean;
  firmwareVersion: string | null;
};

function isValidSignalrHubArray(array: unknown): array is SignalrHub[] {
  if (!Array.isArray(array)) {
    return false;
  }

  return array.every(
    (item) =>
      typeof item === 'object' &&
      item !== null &&
      'device' in item &&
      'online' in item &&
      'firmwareVersion' in item &&
      typeof item.device === 'string' &&
      typeof item.online === 'boolean' &&
      (typeof item.firmwareVersion === 'string' || item.firmwareVersion === null)
  );
}

export function handleSignalrDeviceState(array: unknown) {
  if (!isValidSignalrHubArray(array)) {
    console.error('Received invalid SignalR DeviceState event', array);
    toast.error('Received invalid update from server!');
    return;
  }

  OnlineHubsStore.update((state) => {
    array.forEach((entry) => {
      state.set(entry.device, {
        hubId: entry.device,
        isOnline: entry.online,
        firmwareVersion: entry.firmwareVersion,
      });
    });

    return state;
  });
}

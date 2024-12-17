import { refreshOwnHubs } from '$lib/stores/HubsStore';
import { isNumber, isString } from '$lib/typeguards';
import { toast } from 'svelte-sonner';

export function handleSignalrDeviceUpdate(deviceId: unknown, count: unknown) {
  if (isString(deviceId) && isNumber(count)) {
    refreshOwnHubs();
    return;
  }

  console.error('Received invalid SignalR DeviceUpdate event', deviceId, count);
  toast.error('Received invalid update from server!');
}

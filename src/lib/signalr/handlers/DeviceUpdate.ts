import { refreshOwnHubs } from "$lib/stores/HubsStore";
import { toast } from "svelte-sonner";

function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function isNumber(value: unknown): value is number {
  return typeof value === 'number';
}

export function handleSignalrDeviceUpdate(deviceId: unknown, count: unknown) {
  if (isString(deviceId) && isNumber(count)) {
    refreshOwnHubs();
    return;
  }
  
  console.error('Received invalid SignalR DeviceUpdate event', deviceId, count);
  toast.error('Received invalid update from server!');
}
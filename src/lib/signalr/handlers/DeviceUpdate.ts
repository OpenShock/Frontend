import { refreshOwnHubs } from '$lib/stores/HubsStore';
import { isNumber, isString } from '$lib/typeguards';
import { toast } from 'svelte-sonner';

enum UpdateType {
  HubCreated = 0,
  HubUpdated = 1,
  HubDeleted = 3,

  HubShockersUpdate = 2,
}

function isDeviceUpdateType(value: unknown): value is UpdateType {
  return (
    isNumber(value) &&
    [
      UpdateType.HubCreated,
      UpdateType.HubUpdated,
      UpdateType.HubDeleted,
      UpdateType.HubShockersUpdate,
    ].includes(value)
  );
}

export function handleSignalrDeviceUpdate(deviceId: unknown, updateType: unknown) {
  if (!isString(deviceId) || !isDeviceUpdateType(updateType)) {
    console.error('Received invalid SignalR DeviceUpdate event', deviceId, updateType);
    toast.error('Received invalid update from server!');
    return;
  }

  const typeLabel = UpdateType[updateType];

  console.groupCollapsed(`🔄 DeviceUpdate: ${deviceId} → ${typeLabel}`);
  console.log('• Device ID:', deviceId);
  console.log('• Update Type:', updateType, `(${typeLabel})`);
  console.groupEnd();

  refreshOwnHubs();
}

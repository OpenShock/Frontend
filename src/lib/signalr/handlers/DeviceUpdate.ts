import { HubUpdateType, isHubUpdateType } from '$lib/signalr/models/HubUpdateType';
import { refreshOwnHubs } from '$lib/stores/HubsStore';
import { isString } from '$lib/typeguards';
import { toast } from 'svelte-sonner';

export function handleSignalrDeviceUpdate(deviceId: unknown, updateType: unknown) {
  if (!isString(deviceId) || !isHubUpdateType(updateType)) {
    console.error('Received invalid SignalR DeviceUpdate event', deviceId, updateType);
    toast.error('Received invalid update from server!');
    return;
  }

  const typeLabel = HubUpdateType[updateType];

  console.log(`🔄 DeviceUpdate: ${deviceId} → ${typeLabel}`);

  refreshOwnHubs();
}

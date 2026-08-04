import { HubUpdateType, isHubUpdateType } from '$lib/signalr/models/HubUpdateType';
import { notifyHubPaired, refreshOwnHubs } from '$lib/state/hubs-state.svelte';
import { isString } from '@openshock/svelte-core/typeguards/index.js';
import { toast } from 'svelte-sonner';

export function handleSignalrDeviceUpdate(deviceId: unknown, updateType: unknown) {
  if (!isString(deviceId) || !isHubUpdateType(updateType)) {
    console.error('Received invalid SignalR DeviceUpdate event', deviceId, updateType);
    toast.error('Received invalid update from server!');
    return;
  }

  // Pairing doesn't change the hub list; just notify any open pair-code dialog.
  if (updateType === HubUpdateType.HubPaired) {
    notifyHubPaired(deviceId);
    return;
  }

  refreshOwnHubs();
}

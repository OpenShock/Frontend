import { m } from '#lib/paraglide/messages.js';
import { isDeviceOnlineState } from '#lib/signalr/models/DeviceOnlineState.js';
import { HubOnlineState, onlineHubs } from '#lib/state/hubs-state.svelte.js';
import { toast } from 'svelte-sonner';

export function handleSignalrDeviceStatus(array: unknown) {
  if (!Array.isArray(array) || !array.every(isDeviceOnlineState)) {
    console.error('Received invalid SignalR DeviceStatus event', array);
    toast.error(m.signalr_invalid_update());
    return;
  }

  for (const entry of array) {
    const existing = onlineHubs.get(entry.device);
    if (existing) {
      existing.isOnline = entry.online;
      existing.firmwareVersion = entry.firmwareVersion;
    } else {
      onlineHubs.set(
        entry.device,
        new HubOnlineState(entry.device, entry.online, entry.firmwareVersion)
      );
    }
  }
}

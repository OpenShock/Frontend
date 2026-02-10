import { OnlineHubsStore } from '$lib/stores/HubsStore';
import { isNumber, isString } from '$lib/typeguards';
import { toast } from 'svelte-sonner';

/**
 * Handles OTA rollback event for a hub.
 */
export function handleSignalrOtaRollback(hubId: unknown, updateId: unknown): void {
  if (!isString(hubId) || !isNumber(updateId)) {
    console.error('Invalid OTA rollback payload', hubId, updateId);
    toast.error('Received invalid OTA rollback data!');
    return;
  }

  OnlineHubsStore.update((hubs) => {
    const hub = hubs.get(hubId);
    if (hub && hub.otaInstall?.id === updateId) {
      hub.otaInstall = null;
      hub.otaResult = { success: false, message: 'Device rolled back to previous version' };
    }
    return hubs;
  });

  toast.warning('Hub firmware rolled back to previous version');
}

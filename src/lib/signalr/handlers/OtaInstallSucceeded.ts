import { OnlineHubsStore } from '$lib/stores/HubsStore';
import { isNumber, isString } from '$lib/typeguards';
import { toast } from 'svelte-sonner';

/**
 * Handles successful completion of an OTA install.
 */
export function handleSignalrOtaInstallSucceeded(hubId: unknown, updateId: unknown): void {
  if (!isString(hubId) || !isNumber(updateId)) {
    console.error('Invalid OTA install succeeded payload', hubId, updateId);
    toast.error('Received invalid OTA install success data!');
    return;
  }

  OnlineHubsStore.update((hubs) => {
    const hub = hubs.get(hubId);
    if (hub && hub.otaInstall?.id === updateId) {
      hub.otaInstall = null;
      hub.otaResult = { success: true, message: 'Update completed successfully' };
    }
    return hubs;
  });

  toast.success('Hub firmware update completed successfully!');
}

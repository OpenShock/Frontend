import { OnlineHubsStore } from '$lib/stores/HubsStore';
import { isBoolean, isNumber, isString } from '$lib/typeguards';
import { toast } from 'svelte-sonner';

/**
 * Handles a failed OTA install event.
 */
export function handleSignalrOtaInstallFailed(
  hubId: unknown,
  updateId: unknown,
  fatal: unknown,
  message: unknown
): void {
  if (!isString(hubId) || !isNumber(updateId) || !isBoolean(fatal) || !isString(message)) {
    console.error('Invalid OTA install failed payload', hubId, updateId, fatal, message);
    toast.error('Received invalid OTA install failure data!');
    return;
  }

  OnlineHubsStore.update((hubs) => {
    const hub = hubs.get(hubId);
    if (hub && hub.otaInstall?.id === updateId) {
      hub.otaInstall = null;
      hub.otaResult = { success: false, message };
    }
    return hubs;
  });

  toast.error(`Hub firmware update failed: ${message}`);
}

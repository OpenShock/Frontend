import { onlineHubs } from '$lib/stores/HubsStore.svelte';
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

  const hub = onlineHubs.get(hubId);
  if (hub && hub.otaInstall?.id === updateId) {
    hub.otaInstall = null;
    hub.otaResult = { success: false, message };
  }

  toast.error(`Hub firmware update failed: ${message}`);
}

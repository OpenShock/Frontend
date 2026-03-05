import { onlineHubs } from '$lib/stores/HubsStore.svelte';
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

  const hub = onlineHubs.get(hubId);
  if (hub && hub.otaInstall?.id === updateId) {
    onlineHubs.set(hubId, {
      ...hub,
      otaInstall: null,
      otaResult: { success: true, message: 'Update completed successfully' },
    });
  }

  toast.success('Hub firmware update completed successfully!');
}

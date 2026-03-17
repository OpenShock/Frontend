import { onlineHubs } from '$lib/state/hubs-state.svelte';
import { isNumber, isString } from '$lib/typeguards';
import { toast } from 'svelte-sonner';

/**
 * Handles the start of an OTA install process for a hub.
 */
export function handleSignalrOtaInstallStarted(
  hubId: unknown,
  updateId: unknown,
  targetVersion: unknown
): void {
  if (!isString(hubId) || !isNumber(updateId) || !isString(targetVersion)) {
    console.error('Invalid OTA install started payload', hubId, updateId, targetVersion);
    toast.error('Received invalid OTA install start data!');
    return;
  }

  const hub = onlineHubs.get(hubId);
  if (hub) {
    hub.otaInstall = { id: updateId, version: targetVersion, task: 0, progress: 0 };
  }
}

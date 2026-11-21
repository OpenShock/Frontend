import { m } from '#lib/paraglide/messages.js';
import { onlineHubs } from '#lib/state/hubs-state.svelte.js';
import { isNumber, isString } from '@openshock/svelte-core/typeguards';
import { toast } from 'svelte-sonner';

/**
 * Handles successful completion of an OTA install.
 */
export function handleSignalrOtaInstallSucceeded(hubId: unknown, updateId: unknown): void {
  if (!isString(hubId) || !isNumber(updateId)) {
    console.error('Invalid OTA install succeeded payload', hubId, updateId);
    toast.error(m.signalr_invalid_ota());
    return;
  }

  const hub = onlineHubs.get(hubId);
  if (hub && hub.otaInstall?.id === updateId) {
    hub.otaInstall = null;
    hub.otaResult = { success: true, message: 'Update completed successfully' };
  }

  toast.success(m.ota_toast_succeeded());
}

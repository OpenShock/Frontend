import { m } from '#lib/paraglide/messages.js';
import { onlineHubs } from '#lib/state/hubs-state.svelte.js';
import { isNumber, isString } from '@openshock/svelte-core/typeguards';
import { toast } from 'svelte-sonner';

/**
 * Handles OTA rollback event for a hub.
 */
export function handleSignalrOtaRollback(hubId: unknown, updateId: unknown): void {
  if (!isString(hubId) || !isNumber(updateId)) {
    console.error('Invalid OTA rollback payload', hubId, updateId);
    toast.error(m.signalr_invalid_ota());
    return;
  }

  const hub = onlineHubs.get(hubId);
  if (hub && hub.otaInstall?.id === updateId) {
    hub.otaInstall = null;
    hub.otaResult = { success: false, message: 'Device rolled back to previous version' };
  }

  toast.warning(m.ota_toast_rolled_back());
}

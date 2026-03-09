import { isOtaUpdateProgressTask } from '$lib/signalr/models/OtaUpdateProgressTask';
import { onlineHubs } from '$lib/state/hubs-state.svelte';
import { isNumber, isString } from '$lib/typeguards';
import { toast } from 'svelte-sonner';

/**
 * Handles OTA install progress updates for a hub.
 */
export function handleSignalrOtaInstallProgress(
  hubId: unknown,
  updateId: unknown,
  task: unknown,
  progress: unknown
): void {
  if (
    !isString(hubId) ||
    !isNumber(updateId) ||
    !isOtaUpdateProgressTask(task) ||
    !isNumber(progress)
  ) {
    console.error('Invalid OTA install progress payload', hubId, updateId, task, progress);
    toast.error('Received invalid OTA install progress data!');
    return;
  }

  const hub = onlineHubs.get(hubId);
  if (hub && hub.otaInstall?.id === updateId) {
    hub.otaInstall = { ...hub.otaInstall, task, progress };
  }
}

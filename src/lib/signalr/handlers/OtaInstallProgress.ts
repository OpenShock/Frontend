import { isOtaUpdateProgressTask } from '$lib/signalr/models/OtaUpdateProgressTask';
import { OnlineHubsStore } from '$lib/stores/HubsStore';
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

  OnlineHubsStore.update((hubs) => {
    const hub = hubs.get(hubId);
    if (hub && hub.otaInstall?.id === updateId) {
      hub.otaInstall.task = task;
      hub.otaInstall.progress = progress;
    }
    return hubs;
  });
}

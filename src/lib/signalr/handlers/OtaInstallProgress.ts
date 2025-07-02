import { OnlineHubsStore } from '$lib/stores/HubsStore';
import { isNumber, isString } from '$lib/typeguards';
import { toast } from 'svelte-sonner';

enum OtaUpdateProgressTask {
  FetchingMetadata = 0,
  PreparingForUpdate = 1,
  FlashingFilesystem = 2,
  VerifyingFilesystem = 3,
  FlashingApplication = 4,
  MarkingApplicationBootable = 5,
  Rebooting = 6,
}

function isOtaUpdateProgressTask(value: unknown): value is OtaUpdateProgressTask {
  return (
    isNumber(value) &&
    [
      OtaUpdateProgressTask.FetchingMetadata,
      OtaUpdateProgressTask.PreparingForUpdate,
      OtaUpdateProgressTask.FlashingFilesystem,
      OtaUpdateProgressTask.VerifyingFilesystem,
      OtaUpdateProgressTask.FlashingApplication,
      OtaUpdateProgressTask.MarkingApplicationBootable,
      OtaUpdateProgressTask.Rebooting,
    ].includes(value)
  );
}

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

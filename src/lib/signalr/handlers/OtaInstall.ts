import { OnlineHubsStore } from '$lib/stores/HubsStore';
import { isBoolean, isNumber, isString } from '$lib/typeguards';
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

  OnlineHubsStore.update((hubs) => {
    const hub = hubs.get(hubId);
    if (hub) {
      hub.otaInstall = {
        id: updateId,
        version: targetVersion,
        task: 0,
        progress: 0,
      };
    }
    return hubs;
  });
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
    }
    return hubs;
  });
}

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
      //hub.otaError = { fatal, message };
    }
    return hubs;
  });
}

/**
 * Handles OTA rollback event for a hub.
 */
export function handleSignalrOtaRollback(hubId: unknown, updateId: unknown): void {
  if (!isString(hubId) || !isNumber(updateId)) {
    console.error('Invalid OTA rollback payload', hubId, updateId);
    toast.error('Received invalid OTA rollback data!');
    return;
  }

  OnlineHubsStore.update((hubs) => {
    const hub = hubs.get(hubId);
    if (hub && hub.otaInstall?.id === updateId) {
      hub.otaInstall = null;
      //hub.otaError = { fatal: false, message: 'Rollback performed' };
    }
    return hubs;
  });
}

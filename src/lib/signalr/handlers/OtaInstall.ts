import { OnlineHubsStore } from '$lib/stores/HubsStore';

export function handleSignalrOtaInstallStarted(
  hubId: string,
  updateId: number,
  targetVersion: string
) {
  OnlineHubsStore.update((hubs) => {
    const hub = hubs.get(hubId);
    if (hub) {
      hub.otaInstall = {
        id: updateId,
        version: targetVersion,
        step: 0,
        progress: 0,
      };
    }

    return hubs;
  });
}

export function handleSignalrOtaInstallProgress(
  hubId: string,
  updateId: number,
  step: number,
  progress: number
) {
  OnlineHubsStore.update((hubs) => {
    const hub = hubs.get(hubId);
    if (hub && hub.otaInstall?.id === updateId) {
      hub.otaInstall.step = step;
      hub.otaInstall.progress = progress;
    }

    return hubs;
  });
}

export function handleSignalrOtaInstallSucceeded(hubId: string, updateId: number) {
  OnlineHubsStore.update((hubs) => {
    const hub = hubs.get(hubId);
    if (hub && hub.otaInstall?.id === updateId) {
      hub.otaInstall = null;
    }

    return hubs;
  });
}

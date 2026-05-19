import type { DeviceWithShockersResponse } from '$lib/api';
import { shockerListShockers } from '$lib/api';
import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
import type { OtaUpdateProgressTask } from '$lib/signalr/models/OtaUpdateProgressTask';
import { SvelteMap } from 'svelte/reactivity';

export type OwnHub = DeviceWithShockersResponse;

export type OtaInstallState = {
  id: number;
  version: string;
  task: OtaUpdateProgressTask;
  progress: number;
};

export type OtaResultState = {
  success: boolean;
  message: string;
};

export class HubOnlineState {
  hubId: string;
  isOnline = $state<boolean>(false);
  firmwareVersion = $state<string | null>(null);
  otaInstall = $state<OtaInstallState | null>(null);
  otaResult = $state<OtaResultState | null>(null);

  constructor(hubId: string, isOnline: boolean, firmwareVersion: string | null) {
    this.hubId = hubId;
    this.isOnline = isOnline;
    this.firmwareVersion = firmwareVersion;
  }
}

export const ownHubs = new SvelteMap<string, OwnHub>();
export const onlineHubs = new SvelteMap<string, HubOnlineState>();

export async function refreshOwnHubs() {
  try {
    const { data } = await shockerListShockers();
    if (!data) throw new Error('Failed to fetch devices');

    ownHubs.clear();
    for (const d of data) {
      ownHubs.set(d.id, d);
    }
  } catch (error) {
    handleApiError(error);
  }
}

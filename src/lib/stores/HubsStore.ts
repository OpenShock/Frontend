import { shockersV1Api } from '$lib/api';
import type { ResponseDeviceWithShockers } from '$lib/api/internal/v1';
import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
import { writable } from 'svelte/store';

export type OwnHub = ResponseDeviceWithShockers;

export enum OtaUpdateProgressTask {
  FetchingMetadata = 0,
  PreparingForUpdate = 1,
  FlashingFilesystem = 2,
  VerifyingFilesystem = 3,
  FlashingApplication = 4,
  MarkingApplicationBootable = 5,
  Rebooting = 6,
}

export type HubOnlineState = {
  hubId: string;
  isOnline: boolean;
  firmwareVersion: string | null;
  otaInstall: {
    id: number;
    version: string;
    task: OtaUpdateProgressTask;
    progress: number;
  } | null;
};

export const OwnHubsStore = writable<Map<string, OwnHub>>(new Map());
export const OnlineHubsStore = writable<Map<string, HubOnlineState>>(new Map());

export function refreshOwnHubs() {
  shockersV1Api
    .shockerListShockers()
    .then((response) => {
      if (!response.data) {
        throw new Error(`Failed to fetch devices: ${response.message}`);
      }

      OwnHubsStore.set(new Map(response.data.map((d) => [d.id, d])));
    })
    .catch(handleApiError);
}

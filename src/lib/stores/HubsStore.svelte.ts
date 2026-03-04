import { SvelteMap } from 'svelte/reactivity';
import { shockersV1Api } from '$lib/api';
import type { DeviceWithShockersResponse } from '$lib/api/internal/v1';
import { handleApiError } from '$lib/errorhandling/apiErrorHandling';
import type { OtaUpdateProgressTask } from '$lib/signalr/models/OtaUpdateProgressTask';

export type OwnHub = DeviceWithShockersResponse;
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

export const ownHubs = new SvelteMap<string, OwnHub>();
export const onlineHubs = new SvelteMap<string, HubOnlineState>();

export async function refreshOwnHubs() {
  try {
    const response = await shockersV1Api.shockerListShockers();
    if (!response.data) {
      throw new Error(`Failed to fetch devices: ${response.message}`);
    }

    ownHubs.clear();
    for (const d of response.data) {
      ownHubs.set(d.id, d);
    }
  } catch (error) {
    handleApiError(error);
  }
}

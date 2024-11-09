import { shockerV1Api } from "$lib/api";
import type { ResponseDeviceWithShockers } from "$lib/api/internal/v1";
import { writable } from "svelte/store";

export type OwnDevice = ResponseDeviceWithShockers;
export interface DeviceOnlineState {
  device: string;
  online: boolean;
  firmwareVersion: string | null;
};

export const OwnDevicesStore = writable<Map<string, OwnDevice>>(new Map());
export const OnlineDevicesStore = writable<Map<string, DeviceOnlineState>>(new Map());

export function refreshOwnDevices() {
  shockerV1Api.shockerListShockers()
    .then((response) => {
      if (!response.data) {
        throw new Error(`Failed to fetch devices: ${response.message}`);
      }

      OwnDevicesStore.set(new Map(response.data.map((d) => [d.id, d])));
    })
    .catch((error) => {
      console.error(error); // TODO: Show toast
    });
}

export function initializeDevicesStore() {
  refreshOwnDevices();
}

import { shockerV1Api } from "$lib/api";
import type { ResponseDeviceWithShockers } from "$lib/api/internal/v1";
import { writable } from "svelte/store";

export type OwnDevice = ResponseDeviceWithShockers;
export interface OwnDeviceState {
  device: string;
  online: boolean;
  firmwareVersion: string;
};

export const OwnDevicesStore = writable<OwnDevice[] | null>(null);
export const OwnDeviceStatesStore = writable<OwnDeviceState[] | null>(null);

export function refreshOwnDevices() {
  shockerV1Api.shockerListShockers()
    .then((response) => {
      if (!response.data) {
        throw new Error(`Failed to fetch devices: ${response.message}`);
      }

      OwnDevicesStore.set(response.data);
    })
    .catch((error) => {
      console.error(error); // TODO: Show toast
    });
}

export function initializeDevicesStore() {
  refreshOwnDevices();
}

import { browser } from "$app/environment";
import { shockerV1Api } from "$lib/api";
import type { ResponseDeviceWithShockers } from "$lib/api/internal/v1";
import { writable } from "svelte/store";

export type OwnDevice = ResponseDeviceWithShockers;
export interface OwnDeviceState {
  device: string;
  online: boolean;
  firmwareVersion: string;
};

const OwnDevicesStore = writable<OwnDevice[] | null>(null);
const OwnDeviceStatesStore = writable<OwnDeviceState[] | null>(null);

function refreshOwnDevices() {
  shockerV1Api.shockerListShockers().then((response) => {
    if (!response.data) {
      throw new Error(`Failed to fetch devices: ${response.message}`);
    }

    OwnDevicesStore.set(response.data);
  });
}

if (browser) {
  refreshOwnDevices();
}

export { OwnDevicesStore, OwnDeviceStatesStore, refreshOwnDevices };

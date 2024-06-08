import { browser } from "$app/environment";
import { deviceApi, devicesApi } from "$lib/api";
import type { ResponseDevice } from "$lib/api/internal/v1";
import { writable } from "svelte/store";

export type OwnDevice = ResponseDevice;
export interface OwnDeviceState {
  device: string;
  online: boolean;
  firmwareVersion: string;
};

const OwnDevicesStore = writable<OwnDevice[] | null>(null);
const OwnDeviceStatesStore = writable<OwnDeviceState[] | null>(null);

if (browser) {
  const response = await devicesApi.devicesListDevices();

  if (!response.data) {
    throw new Error(`Failed to fetch devices: ${response.message}`);
  }

  OwnDevicesStore.set(response.data);
}

export { OwnDevicesStore, OwnDeviceStatesStore };

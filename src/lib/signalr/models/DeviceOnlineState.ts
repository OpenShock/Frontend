import { isBoolean, isObject, isString } from '$lib/typeguards';

export interface DeviceOnlineState {
  device: string;
  online: boolean;
  firmwareVersion: string | null;
}

export function isDeviceOnlineState(value: unknown): value is DeviceOnlineState {
  return (
    isObject(value) &&
    Object.hasOwn(value, 'device') &&
    Object.hasOwn(value, 'online') &&
    Object.hasOwn(value, 'firmwareVersion') &&
    isString(value.device) &&
    isBoolean(value.online) &&
    (value.firmwareVersion === null || isString(value.firmwareVersion))
  );
}

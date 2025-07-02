import { isObject } from '$lib/typeguards';

export interface DeviceOnlineState {
  device: string;
  online: boolean;
  firmwareVersion: string | null;
}

export function isDeviceOnlineState(value: unknown): value is DeviceOnlineState {
  return (
    isObject(value) &&
    'device' in value &&
    'online' in value &&
    'firmwareVersion' in value &&
    typeof value.device === 'string' &&
    typeof value.online === 'boolean' &&
    (typeof value.firmwareVersion === 'string' || value.firmwareVersion === null)
  );
}

import { isObject } from '$lib/typeguards';
import { HasBoolean, HasString, HasStringOrNull } from '$lib/typeguards/propGuards';

export interface DeviceOnlineState {
  device: string;
  online: boolean;
  firmwareVersion: string | null;
}

export function isDeviceOnlineState(value: unknown): value is DeviceOnlineState {
  return (
    isObject(value) &&
    HasString(value, 'device') &&
    HasBoolean(value, 'online') &&
    HasStringOrNull(value, 'firmwareVersion')
  );
}

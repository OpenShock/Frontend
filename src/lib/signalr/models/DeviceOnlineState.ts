import {
  HasBoolean,
  HasString,
  HasStringOrNull,
  isObject,
} from '@openshock/svelte-core/typeguards';

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

import { isNumber } from '$lib/typeguards';

export enum ControlType {
  Stop = 0,
  Shock = 1,
  Vibrate = 2,
  Sound = 3,
}

export function isControlType(value: unknown): value is ControlType {
  return isNumber(value) && value in ControlType;
}

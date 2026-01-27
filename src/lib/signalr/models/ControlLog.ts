import { isObject } from '$lib/typeguards';
import { HasNumber, HasString } from '$lib/typeguards/propGuards';
import { ControlType, isControlType } from './ControlType';

interface ControlLogShockerInfo {
  id: string;
  name: string;
}
export interface ControlLog {
  shocker: ControlLogShockerInfo;
  type: ControlType;
  intensity: number;
  duration: number;
  executedAt: string;
}

function isControlLogShockerInfo(value: unknown): value is ControlLogShockerInfo {
  return isObject(value) && HasString(value, 'id') && HasString(value, 'name');
}
export function isControlLog(value: unknown): value is ControlLog {
  return (
    isObject(value) &&
    Object.hasOwn(value, 'shocker') &&
    Object.hasOwn(value, 'type') &&
    HasNumber(value, 'intensity') &&
    HasNumber(value, 'duration') &&
    HasString(value, 'executedAt') &&
    isControlLogShockerInfo(value.shocker) &&
    isControlType(value.type)
  );
}

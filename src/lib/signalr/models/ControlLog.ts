import { isNumber, isObject, isString } from '$lib/typeguards';
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
  return (
    isObject(value) &&
    Object.hasOwn(value, 'id') &&
    Object.hasOwn(value, 'name') &&
    isString(value.id) &&
    isString(value.name)
  );
}
export function isControlLog(value: unknown): value is ControlLog {
  return (
    isObject(value) &&
    Object.hasOwn(value, 'shocker') &&
    Object.hasOwn(value, 'type') &&
    Object.hasOwn(value, 'intensity') &&
    Object.hasOwn(value, 'duration') &&
    Object.hasOwn(value, 'executedAt') &&
    isControlLogShockerInfo(value.shocker) &&
    isControlType(value.type) &&
    isNumber(value.intensity) &&
    isNumber(value.duration) &&
    isString(value.executedAt)
  );
}

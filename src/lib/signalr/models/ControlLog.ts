import { isNumber, isObject, isString } from '$lib/typeguards';

interface ControlLogShockerInfo {
  id: string;
  name: string;
}
export interface ControlLog {
  shocker: ControlLogShockerInfo;
  type: number;
  intensity: number;
  duration: number;
  executedAt: string;
}

function isControlLogShockerInfo(value: unknown): value is ControlLogShockerInfo {
  return (
    isObject(value) &&
    'id' in value &&
    isString(value.id) &&
    'name' in value &&
    isString(value.name)
  );
}
export function isControlLog(value: unknown): value is ControlLog {
  return (
    isObject(value) &&
    'shocker' in value &&
    isControlLogShockerInfo(value.shocker) &&
    'type' in value &&
    isNumber(value.type) &&
    'intensity' in value &&
    isNumber(value.intensity) &&
    'duration' in value &&
    isNumber(value.duration) &&
    'executedAt' in value &&
    isString(value.executedAt)
  );
}

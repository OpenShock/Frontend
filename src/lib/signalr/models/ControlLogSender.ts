import { isObject, isString } from '$lib/typeguards';

export interface ControlLogSender {
  connectionId: string;
  additionalItems: { [key: string]: object };
  id: string;
  name: string;
  image: string;
  customName: string | null;
}

export function isControlLogSender(value: unknown): value is ControlLogSender {
  return (
    isObject(value) &&
    'connectionId' in value &&
    isString(value.connectionId) &&
    'additionalItems' in value &&
    isObject(value.additionalItems) &&
    Object.values(value.additionalItems).every(isObject) &&
    'id' in value &&
    isString(value.id) &&
    'name' in value &&
    isString(value.name) &&
    'image' in value &&
    isString(value.image) &&
    'customName' in value &&
    (value.customName === null || isString(value.customName))
  );
}

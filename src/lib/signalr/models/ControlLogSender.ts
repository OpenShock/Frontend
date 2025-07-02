import { isObject, isString } from '$lib/typeguards';

export interface ControlLogSender {
  connectionId: string;
  additionalItems: object;
  id: string;
  name: string;
  image: string;
  customName: string | null;
}

export function isControlLogSender(value: unknown): value is ControlLogSender {
  return (
    isObject(value) &&
    Object.hasOwn(value, 'connectionId') &&
    Object.hasOwn(value, 'additionalItems') &&
    Object.hasOwn(value, 'id') &&
    Object.hasOwn(value, 'name') &&
    Object.hasOwn(value, 'image') &&
    Object.hasOwn(value, 'customName') &&
    isString(value.connectionId) &&
    isObject(value.additionalItems) &&
    isString(value.id) &&
    isString(value.name) &&
    isString(value.image) &&
    (value.customName === null || isString(value.customName))
  );
}

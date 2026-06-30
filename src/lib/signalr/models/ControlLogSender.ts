import {
  HasObject,
  HasString,
  HasStringOrNull,
  isObject,
} from '@openshock/svelte-core/typeguards/index.js';

export interface ControlLogSender {
  connectionId: string;
  additionalItems: Record<string, unknown>;
  id: string;
  name: string;
  image: string;
  customName: string | null;
}

export function isControlLogSender(value: unknown): value is ControlLogSender {
  return (
    isObject(value) &&
    HasString(value, 'connectionId') &&
    HasObject(value, 'additionalItems') &&
    HasString(value, 'id') &&
    HasString(value, 'name') &&
    HasString(value, 'image') &&
    HasStringOrNull(value, 'customName')
  );
}

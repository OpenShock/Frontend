import { HasString, isObject } from '@openshock/svelte-core/typeguards';
import { TransformError } from '../TransformError';
import type { FirmwareChipRef } from '../models';

export function TransformFirmwareChipRef(data: unknown): FirmwareChipRef {
  if (!isObject(data)) {
    throw new TransformError('Expected object for FirmwareChipRef');
  }

  if (!HasString(data, 'name')) throw new TransformError('Expected string: name');

  return {
    name: data.name,
  };
}

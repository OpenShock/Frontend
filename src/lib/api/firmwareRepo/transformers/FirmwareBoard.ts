import { HasBoolean, isObject } from '@openshock/svelte-core/typeguards';
import { TransformError } from '../TransformError';
import type { FirmwareBoard } from '../models';
import { TransformFirmwareArtifact } from './FirmwareArtifact';
import { TransformFirmwareChipRef } from './FirmwareChipRef';
import { RequiredArray } from './props';

export function TransformFirmwareBoard(data: unknown): FirmwareBoard {
  if (!isObject(data)) {
    throw new TransformError('Expected object for FirmwareBoard');
  }

  // Captured before the guards below narrow `data` and drop its index signature.
  const chip = data.chip;

  if (!HasBoolean(data, 'discontinued')) throw new TransformError('Expected boolean: discontinued');

  return {
    chip: TransformFirmwareChipRef(chip),
    discontinued: data.discontinued,
    artifacts: RequiredArray(data, 'artifacts').map(TransformFirmwareArtifact),
  };
}

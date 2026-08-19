import { HasString, isObject } from '@openshock/svelte-core/typeguards';
import { TransformError } from '../TransformError';
import type { FirmwareBoardRelease } from '../models';
import { TransformFirmwareArtifact } from './FirmwareArtifact';
import { RequiredArray } from './props';

export function TransformFirmwareBoardRelease(data: unknown): FirmwareBoardRelease {
  if (!isObject(data)) {
    throw new TransformError('Expected object for FirmwareBoardRelease');
  }

  if (!HasString(data, 'version')) throw new TransformError('Expected string: version');
  if (!HasString(data, 'boardId')) throw new TransformError('Expected string: boardId');

  return {
    version: data.version,
    boardId: data.boardId,
    artifacts: RequiredArray(data, 'artifacts').map(TransformFirmwareArtifact),
  };
}

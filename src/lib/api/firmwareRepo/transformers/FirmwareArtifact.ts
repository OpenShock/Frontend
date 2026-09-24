import { HasNumber, HasString, isObject } from '@openshock/svelte-core/typeguards';
import { TransformError } from '../TransformError';
import type { FirmwareArtifact } from '../models';

export function TransformFirmwareArtifact(data: unknown): FirmwareArtifact {
  if (!isObject(data)) {
    throw new TransformError('Expected object for FirmwareArtifact');
  }

  if (!HasString(data, 'type')) throw new TransformError('Expected string: type');
  if (!HasString(data, 'url')) throw new TransformError('Expected string: url');
  if (!HasString(data, 'sha256Hash')) throw new TransformError('Expected string: sha256Hash');
  if (!HasNumber(data, 'fileSize')) throw new TransformError('Expected number: fileSize');

  return {
    type: data.type,
    url: data.url,
    sha256Hash: data.sha256Hash,
    fileSize: data.fileSize,
  };
}

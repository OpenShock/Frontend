import { HasString, isObject } from '@openshock/svelte-core/typeguards';
import { TransformError } from '../TransformError';
import type { FirmwareSource } from '../models';
import { TransformFirmwareRepository } from './FirmwareRepository';
import { OptionalStringOrNull } from './props';

export function TransformFirmwareSource(data: unknown): FirmwareSource {
  if (!isObject(data)) {
    throw new TransformError('Expected object for FirmwareSource');
  }

  // Captured before the guards below narrow `data` and drop its index signature.
  const repository = data.repository;

  if (!HasString(data, 'commitHash')) throw new TransformError('Expected string: commitHash');
  if (!HasString(data, 'commitUrl')) throw new TransformError('Expected string: commitUrl');

  return {
    repository: TransformFirmwareRepository(repository),
    commitHash: data.commitHash,
    ref: OptionalStringOrNull(data, 'ref'),
    runId: OptionalStringOrNull(data, 'runId'),
    commitUrl: data.commitUrl,
    refUrl: OptionalStringOrNull(data, 'refUrl'),
    runUrl: OptionalStringOrNull(data, 'runUrl'),
  };
}

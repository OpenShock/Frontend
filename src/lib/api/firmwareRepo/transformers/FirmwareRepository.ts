import { HasString, isObject } from '@openshock/svelte-core/typeguards';
import { TransformError } from '../TransformError';
import type { FirmwareRepository } from '../models';

export function TransformFirmwareRepository(data: unknown): FirmwareRepository {
  if (!isObject(data)) {
    throw new TransformError('Expected object for FirmwareRepository');
  }

  if (!HasString(data, 'id')) throw new TransformError('Expected string: id');
  if (!HasString(data, 'provider')) throw new TransformError('Expected string: provider');
  if (!HasString(data, 'owner')) throw new TransformError('Expected string: owner');
  if (!HasString(data, 'repo')) throw new TransformError('Expected string: repo');

  return {
    id: data.id,
    provider: data.provider,
    owner: data.owner,
    repo: data.repo,
  };
}

import { HasNumber, isObject } from '@openshock/svelte-core/typeguards';
import { TransformError } from '../TransformError';
import type { FirmwareVersionHistory } from '../models';
import { TransformFirmwareVersionSummary } from './FirmwareVersionSummary';
import { RequiredArray } from './props';

export function TransformFirmwareVersionHistory(data: unknown): FirmwareVersionHistory {
  if (!isObject(data)) {
    throw new TransformError('Expected object for FirmwareVersionHistory');
  }

  if (!HasNumber(data, 'total')) throw new TransformError('Expected number: total');

  return {
    versions: RequiredArray(data, 'versions').map(TransformFirmwareVersionSummary),
    total: data.total,
  };
}

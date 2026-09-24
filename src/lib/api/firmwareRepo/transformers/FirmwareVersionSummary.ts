import { HasString, isObject } from '@openshock/svelte-core/typeguards';
import { TransformError } from '../TransformError';
import type { FirmwareVersionSummary } from '../models';
import { TransformFirmwareReleaseNote } from './FirmwareReleaseNote';
import { TransformFirmwareSource } from './FirmwareSource';
import { RequiredArray } from './props';

export function TransformFirmwareVersionSummary(data: unknown): FirmwareVersionSummary {
  if (!isObject(data)) {
    throw new TransformError('Expected object for FirmwareVersionSummary');
  }

  // Captured before the guards below narrow `data` and drop its index signature.
  const source = data.source;

  if (!HasString(data, 'version')) throw new TransformError('Expected string: version');
  if (!HasString(data, 'channel')) throw new TransformError('Expected string: channel');
  if (!HasString(data, 'releaseDate')) throw new TransformError('Expected string: releaseDate');

  let releaseDate: Temporal.Instant;
  try {
    releaseDate = Temporal.Instant.from(data.releaseDate);
  } catch {
    throw new TransformError('Invalid date: releaseDate');
  }

  return {
    version: data.version,
    channel: data.channel,
    releaseDate,
    source: TransformFirmwareSource(source),
    releaseNotes: RequiredArray(data, 'releaseNotes').map(TransformFirmwareReleaseNote),
  };
}

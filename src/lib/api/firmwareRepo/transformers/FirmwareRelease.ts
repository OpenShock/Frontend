import { HasObject, HasString, isObject } from '@openshock/svelte-core/typeguards';
import { TransformError } from '../TransformError';
import type { FirmwareBoard, FirmwareRelease } from '../models';
import { TransformFirmwareBoard } from './FirmwareBoard';
import { TransformFirmwareReleaseNote } from './FirmwareReleaseNote';
import { TransformFirmwareSource } from './FirmwareSource';
import { RequiredArray } from './props';

export function TransformFirmwareRelease(data: unknown): FirmwareRelease {
  if (!isObject(data)) {
    throw new TransformError('Expected object for FirmwareRelease');
  }

  // Captured before the guards below narrow `data` and drop its index signature.
  const source = data.source;

  if (!HasString(data, 'version')) throw new TransformError('Expected string: version');
  // Deliberately not narrowed to FirmwareChannel — the server may publish channels this
  // client does not know about yet, and an unknown one must not fail the whole response.
  if (!HasString(data, 'channel')) throw new TransformError('Expected string: channel');
  if (!HasString(data, 'releaseDate')) throw new TransformError('Expected string: releaseDate');
  if (!HasObject(data, 'boards')) throw new TransformError('Expected object: boards');

  let releaseDate: Temporal.Instant;
  try {
    releaseDate = Temporal.Instant.from(data.releaseDate);
  } catch {
    throw new TransformError('Invalid date: releaseDate');
  }

  const boards: Record<string, FirmwareBoard> = {};
  for (const [name, board] of Object.entries(data.boards)) {
    boards[name] = TransformFirmwareBoard(board);
  }

  return {
    version: data.version,
    channel: data.channel,
    releaseDate,
    source: TransformFirmwareSource(source),
    releaseNotes: RequiredArray(data, 'releaseNotes').map(TransformFirmwareReleaseNote),
    boards,
  };
}

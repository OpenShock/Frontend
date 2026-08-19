import { HasString, isObject } from '@openshock/svelte-core/typeguards';
import { TransformError } from '../TransformError';
import type { FirmwareReleaseNote } from '../models';
import { IsFirmwareReleaseNoteType } from './FirmwareReleaseNoteType';
import { OptionalStringOrNull } from './props';

export function TransformFirmwareReleaseNote(data: unknown): FirmwareReleaseNote {
  if (!isObject(data)) {
    throw new TransformError('Expected object for FirmwareReleaseNote');
  }

  if (!HasString(data, 'type') || !IsFirmwareReleaseNoteType(data.type)) {
    throw new TransformError('Expected FirmwareReleaseNoteType: type');
  }
  if (!HasString(data, 'content')) throw new TransformError('Expected string: content');

  return {
    type: data.type,
    title: OptionalStringOrNull(data, 'title'),
    content: data.content,
  };
}

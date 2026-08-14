import { FirmwareReleaseNoteTypes, type FirmwareReleaseNoteType } from '../models';

export function IsFirmwareReleaseNoteType(value: string): value is FirmwareReleaseNoteType {
  return (FirmwareReleaseNoteTypes as readonly string[]).includes(value);
}

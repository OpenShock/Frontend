import type { FirmwareReleaseNoteType } from './FirmwareReleaseNoteType';

export interface FirmwareReleaseNote {
  type: FirmwareReleaseNoteType;
  title: string | null;
  content: string;
}

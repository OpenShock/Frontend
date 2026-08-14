import type { FirmwareReleaseNote } from './FirmwareReleaseNote';
import type { FirmwareSource } from './FirmwareSource';

export interface FirmwareVersionSummary {
  version: string;
  channel: string;
  releaseDate: Temporal.Instant;
  source: FirmwareSource;
  releaseNotes: FirmwareReleaseNote[];
}

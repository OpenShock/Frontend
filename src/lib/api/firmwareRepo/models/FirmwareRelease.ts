import type { FirmwareBoard } from './FirmwareBoard';
import type { FirmwareReleaseNote } from './FirmwareReleaseNote';
import type { FirmwareSource } from './FirmwareSource';

export interface FirmwareRelease {
  version: string;
  channel: string;
  releaseDate: Temporal.Instant;
  source: FirmwareSource;
  releaseNotes: FirmwareReleaseNote[];
  /** Keyed by canonical board name, e.g. "Wemos-D1-Mini-ESP32". */
  boards: Record<string, FirmwareBoard>;
}

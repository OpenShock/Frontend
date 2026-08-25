import type { FirmwareArtifact } from './FirmwareArtifact';
import type { FirmwareChipRef } from './FirmwareChipRef';

export interface FirmwareBoard {
  chip: FirmwareChipRef;
  discontinued: boolean;
  artifacts: FirmwareArtifact[];
}

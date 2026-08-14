import type { FirmwareArtifact } from './FirmwareArtifact';

/** Minimal single-board response. `boardId` is the canonical board name. */
export interface FirmwareBoardRelease {
  version: string;
  boardId: string;
  artifacts: FirmwareArtifact[];
}

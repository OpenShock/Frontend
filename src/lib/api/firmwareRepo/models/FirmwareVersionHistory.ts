import type { FirmwareVersionSummary } from './FirmwareVersionSummary';

/** One page of version history. `total` counts every version matching the filter, not just this page. */
export interface FirmwareVersionHistory {
  versions: FirmwareVersionSummary[];
  total: number;
}

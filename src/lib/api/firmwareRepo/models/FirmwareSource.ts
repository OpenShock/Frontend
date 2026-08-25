import type { FirmwareRepository } from './FirmwareRepository';

/** Source traceability. URLs are constructed server-side per provider. */
export interface FirmwareSource {
  repository: FirmwareRepository;
  commitHash: string;
  ref: string | null;
  runId: string | null;
  commitUrl: string;
  refUrl: string | null;
  runUrl: string | null;
}

import type { FirmwareRelease } from './models';

/**
 * Board names available in a release, optionally narrowed to a chip.
 *
 * `chip` is matched against the chip's esptool-js name, which is what a connected-device
 * detection returns.
 */
export function ExtractBoards(
  release: FirmwareRelease,
  chip?: string | null,
  includeDiscontinued = false
): string[] {
  const entries = Object.entries(release.boards);
  const filtered = entries.filter(([, board]) => {
    if (!includeDiscontinued && board.discontinued) return false;
    if (chip && board.chip.name !== chip) return false;
    return true;
  });
  return filtered.map(([name]) => name).sort();
}

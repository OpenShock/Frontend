import { PUBLIC_FIRMWARE_REPO_URL } from '$env/static/public';
import { HashBuffer } from '@openshock/svelte-core/utils/crypto.js';

export const FirmwareChannels = ['stable', 'beta', 'develop'] as const;
export type FirmwareChannel = (typeof FirmwareChannels)[number];

export const FirmwareReleaseNoteTypes = ['breaking', 'warning', 'info', 'section'] as const;
export type FirmwareReleaseNoteType = (typeof FirmwareReleaseNoteTypes)[number];

export interface FirmwareArtifact {
  type: string;
  url: string;
  sha256Hash: string;
  fileSize: number;
}

/**
 * Chip reference. `name` is the public identifier and matches esptool-js chip identifiers exactly
 * (e.g. "ESP32-S3") — pass it straight to esptool-js. The chip's UUID is server-internal.
 */
export interface FirmwareChipRef {
  name: string;
}

export interface FirmwareBoard {
  chip: FirmwareChipRef;
  discontinued: boolean;
  artifacts: FirmwareArtifact[];
}

export interface FirmwareReleaseNote {
  type: FirmwareReleaseNoteType;
  title?: string | null;
  content: string;
}

export interface FirmwareRepository {
  id: string;
  provider: string;
  owner: string;
  repo: string;
}

/** Source traceability. URLs are constructed server-side per provider. */
export interface FirmwareSource {
  repository: FirmwareRepository;
  commitHash: string;
  ref?: string | null;
  runId?: string | null;
  commitUrl: string;
  refUrl?: string | null;
  runUrl?: string | null;
}

export interface FirmwareRelease {
  version: string;
  channel: string;
  releaseDate: string;
  source: FirmwareSource;
  releaseNotes: FirmwareReleaseNote[];
  /** Keyed by canonical board name, e.g. "Wemos-D1-Mini-ESP32". */
  boards: Record<string, FirmwareBoard>;
}

export interface FirmwareVersionSummary {
  version: string;
  channel: string;
  releaseDate: string;
  source: FirmwareSource;
  releaseNotes: FirmwareReleaseNote[];
}

/** Minimal single-board response. `boardId` is the canonical board name. */
export interface FirmwareBoardRelease {
  version: string;
  boardId: string;
  artifacts: FirmwareArtifact[];
}

const BASE_URL = PUBLIC_FIRMWARE_REPO_URL.replace(/\/+$/, '');

async function FetchJson<T>(url: string, what: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to ${what}: ${response.status} ${response.statusText}`);
  return (await response.json()) as T;
}

/** Most recent published release for a channel, with every board. */
export async function FetchLatest(channel: FirmwareChannel): Promise<FirmwareRelease> {
  return await FetchJson<FirmwareRelease>(
    `${BASE_URL}/v2/firmware/latest/${channel}`,
    'fetch latest firmware'
  );
}

/**
 * Full release details for one version. Versions are globally unique, so this is not
 * scoped by channel.
 */
export async function FetchVersion(version: string): Promise<FirmwareRelease> {
  return await FetchJson<FirmwareRelease>(
    `${BASE_URL}/v2/firmware/versions/${encodeURIComponent(version)}`,
    'fetch firmware version'
  );
}

/** Artifacts for a single board in a single version. `board` is the board name. */
export async function FetchBoardRelease(
  version: string,
  board: string
): Promise<FirmwareBoardRelease> {
  return await FetchJson<FirmwareBoardRelease>(
    `${BASE_URL}/v2/firmware/versions/${encodeURIComponent(version)}/${encodeURIComponent(board)}`,
    'fetch board release'
  );
}

/** Paginated version history. Channel is an optional filter, passed as a query parameter. */
export async function FetchVersionHistory(
  channel?: FirmwareChannel | null,
  limit = 20,
  offset = 0
): Promise<{ versions: FirmwareVersionSummary[]; total: number }> {
  const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
  if (channel) params.set('channel', channel);

  return await FetchJson<{ versions: FirmwareVersionSummary[]; total: number }>(
    `${BASE_URL}/v2/firmware/versions?${params}`,
    'fetch version history'
  );
}

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

export function FindArtifact(
  release: FirmwareRelease,
  board: string,
  type: string
): FirmwareArtifact | null {
  const boardInfo = release.boards[board];
  if (!boardInfo) return null;
  return boardInfo.artifacts.find((a) => a.type === type) ?? null;
}

async function DownloadBinary(url: string): Promise<Uint8Array> {
  const response = await fetch(url);
  if (!response.ok)
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
  return await response.bytes();
}

export async function DownloadAndVerifyArtifact(artifact: FirmwareArtifact): Promise<Uint8Array> {
  const binary = await DownloadBinary(artifact.url);

  const calculatedHash = await HashBuffer(binary.buffer as ArrayBuffer, 'SHA-256');
  if (calculatedHash.toUpperCase() !== artifact.sha256Hash.toUpperCase()) {
    throw new Error(`Hash mismatch: expected ${artifact.sha256Hash}, got ${calculatedHash}`);
  }

  return binary;
}

import { PUBLIC_FIRMWARE_REPO_URL } from '$env/static/public';
import { HashBuffer } from '$lib/utils/crypto';

export const FirmwareChannels = ['stable', 'beta', 'develop'] as const;
export type FirmwareChannel = (typeof FirmwareChannels)[number];

export interface FirmwareArtifact {
  type: string;
  url: string;
  sha256Hash: string;
  fileSize: number;
}

export interface FirmwareBoard {
  chip: string;
  deprecated: boolean;
  artifacts: FirmwareArtifact[];
}

export interface FirmwareRelease {
  version: string;
  channel: string;
  releaseDate: string;
  changelog: string;
  boards: Record<string, FirmwareBoard>;
}

export interface FirmwareUpdateResponse {
  version: string;
  artifact: FirmwareArtifact;
}

export interface FirmwareVersionSummary {
  version: string;
  channel: string;
  releaseDate: string;
  changelog: string;
}

const BASE_URL = PUBLIC_FIRMWARE_REPO_URL.replace(/\/+$/, '');

export async function FetchLatest(channel: FirmwareChannel): Promise<FirmwareRelease> {
  const response = await fetch(`${BASE_URL}/v2/firmware/latest/${channel}`);
  if (!response.ok)
    throw new Error(`Failed to fetch latest firmware: ${response.status} ${response.statusText}`);
  return await response.json();
}

export async function FetchVersion(
  channel: FirmwareChannel,
  version: string
): Promise<FirmwareRelease> {
  const response = await fetch(`${BASE_URL}/v2/firmware/versions/${channel}/${version}`);
  if (!response.ok)
    throw new Error(`Failed to fetch firmware version: ${response.status} ${response.statusText}`);
  return await response.json();
}

export async function FetchVersionHistory(
  channel: FirmwareChannel,
  limit = 20,
  offset = 0
): Promise<{ versions: FirmwareVersionSummary[]; total: number }> {
  const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
  const response = await fetch(`${BASE_URL}/v2/firmware/versions/${channel}?${params}`);
  if (!response.ok)
    throw new Error(`Failed to fetch version history: ${response.status} ${response.statusText}`);
  return await response.json();
}

export function ExtractBoards(
  release: FirmwareRelease,
  chip?: string | null,
  includeDeprecated = false
): string[] {
  const entries = Object.entries(release.boards);
  const filtered = entries.filter(([, board]) => {
    if (!includeDeprecated && board.deprecated) return false;
    if (chip && board.chip !== chip) return false;
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

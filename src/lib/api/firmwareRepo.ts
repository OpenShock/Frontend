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
  artifacts: FirmwareArtifact[];
}

export interface FirmwareLatestResponse {
  version: string;
  channel: string;
  releaseDate: string;
  boards: Record<string, FirmwareBoard>;
}

const BASE_URL = PUBLIC_FIRMWARE_REPO_URL.replace(/\/+$/, '');

export async function FetchLatest(
  channel: FirmwareChannel,
  board?: string
): Promise<FirmwareLatestResponse> {
  let url = `${BASE_URL}/v2/firmware/latest/${channel}`;
  if (board) {
    url += `?board=${encodeURIComponent(board)}`;
  }
  const response = await fetch(url);
  if (!response.ok)
    throw new Error(`Failed to fetch latest firmware: ${response.status} ${response.statusText}`);
  return await response.json();
}

export function ExtractBoards(latest: FirmwareLatestResponse, chip?: string | null): string[] {
  const entries = Object.entries(latest.boards);
  const filtered = chip ? entries.filter(([, board]) => board.chip === chip) : entries;
  return filtered.map(([name]) => name).sort();
}

export function FindArtifact(
  latest: FirmwareLatestResponse,
  board: string,
  type: string
): FirmwareArtifact | null {
  const boardInfo = latest.boards[board];
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

import { HashBuffer } from '@openshock/svelte-core/utils';
import type { FirmwareArtifact, FirmwareRelease } from './models';

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
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
  }

  if ('bytes' in Response.prototype) {
    return await response.bytes();
  }

  const buf = await response.arrayBuffer();
  return new Uint8Array(buf);
}

export async function DownloadAndVerifyArtifact(artifact: FirmwareArtifact): Promise<Uint8Array> {
  const binary = await DownloadBinary(artifact.url);

  const calculatedHash = await HashBuffer(binary.buffer as ArrayBuffer, 'SHA-256');
  if (calculatedHash.toUpperCase() !== artifact.sha256Hash.toUpperCase()) {
    throw new Error(`Hash mismatch: expected ${artifact.sha256Hash}, got ${calculatedHash}`);
  }

  return binary;
}

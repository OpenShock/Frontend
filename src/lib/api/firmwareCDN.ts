import { HashBuffer } from '$lib/utils/crypto';

export const FirmwareChannels = ['stable', 'beta', 'develop'] as const;
export type FirmwareChannel = (typeof FirmwareChannels)[number];

const BASE_URL = 'https://firmware.openshock.org';

const versionUrl = (channel: string) => `${BASE_URL}/version-${channel}.txt`;
const boardsListUrl = (version: string) => `${BASE_URL}/${version}/boards.txt`;
const boardFileUrl = (version: string, board: string, fileName: string) =>
  `${BASE_URL}/${version}/${board}/${fileName}`;

async function DownloadText(url: string) {
  const response = await fetch(url);
  if (!response.ok)
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
  const text = await response.text();
  return text.trim();
}
async function DownloadLines(url: string) {
  const text = await DownloadText(url);
  return text.split('\n').map((x) => x.trim());
}
async function DownloadBinary(url: string) {
  const response = await fetch(url);
  if (!response.ok)
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
  return await response.bytes();
}

export function FetchChannelVersion(channel: FirmwareChannel) {
  return DownloadText(versionUrl(channel));
}

export function FetchVersionBoards(version: string) {
  return DownloadLines(boardsListUrl(version));
}

export function DownloadBoardBinary(version: string, board: string, filename: string) {
  return DownloadBinary(boardFileUrl(version, board, filename));
}

export async function GetBoardBinaryHashes(
  version: string,
  board: string,
  hashType: 'md5' | 'sha256' = 'sha256'
) {
  const lines = await DownloadLines(boardFileUrl(version, board, `hashes.${hashType}.txt`));

  let hashLength: number;
  switch (hashType) {
    case 'md5':
      hashLength = 32;
      break;
    case 'sha256':
      hashLength = 64;
      break;
    default:
      throw new Error(`Unsupported hash type: ${hashType}`);
  }

  const hashes: Record<string, string> = {};
  for (const line of lines) {
    const parts = line.split(' ');
    if (parts.length < 2) throw new Error(`Invalid hash line: ${line}`);
    const hash = parts[0].trim();
    if (hash.length !== hashLength) throw new Error(`Invalid hash length in line: ${line}`);
    if (!/^[a-f0-9]+$/i.test(hash)) throw new Error(`Invalid hash format in line: ${line}`);

    let filename = parts.slice(1).join(' ').trim(); // Join the rest in case filename has spaces
    if (!filename) throw new Error(`Invalid filename in line: ${line}`);

    if (filename.startsWith('./')) {
      // Remove leading './' if present
      filename = filename.slice(2);
    }

    hashes[filename] = hash;
  }

  return hashes;
}
export async function GetBoardBinaryHash(
  version: string,
  board: string,
  filename: string,
  hashType: 'md5' | 'sha256'
) {
  if (filename.startsWith('./')) {
    filename = filename.slice(2); // Remove leading './' if present
  }

  const hashes = await GetBoardBinaryHashes(version, board, hashType);
  if (filename in hashes) {
    return hashes[filename];
  }

  return null;
}

export async function DownloadAndVerifyBoardBinary(
  version: string,
  board: string,
  filename: string
) {
  // Download the binary and its hash in parallel
  const [binary, hash] = await Promise.all([
    DownloadBinary(boardFileUrl(version, board, filename)),
    GetBoardBinaryHash(version, board, filename, 'sha256'),
  ]);

  if (!hash) {
    throw new Error(`No hash found for ${filename} in board ${board} version ${version}`);
  }

  // Calculate the hash of the downloaded binary
  const calculatedHash = await HashBuffer(binary, 'SHA-256');
  if (calculatedHash !== hash) {
    throw new Error(
      `Hash mismatch for ${filename} in board ${board} version ${version}: expected ${hash}, got ${calculatedHash}`
    );
  }

  return binary;
}

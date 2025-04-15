import { toast } from 'svelte-sonner';

async function DownloadText(url: string) {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const text = await response.text();
    return text.trim();
  } catch (e) {
    console.error(e);
    toast.error(`Failed to fetch ${url}`);
    return null;
  }
}
async function DownloadLines(url: string) {
  const text = await DownloadText(url);
  if (!text) return null;

  return text.split('\n').map((x) => x.trim());
}
async function DownloadBinary(url: string, onProgress: (progress: number) => void) {
  const response = await fetch(url);
  if (!response.ok) return null;

  const contentLength = parseInt(response.headers.get('content-length')?.trim() ?? '0');
  const reader = response.body?.getReader();
  if (!reader) return null;

  console.log(`Downloading ${url} (${contentLength} bytes)`);

  let receivedLength = 0;
  const chunks: Uint8Array[] = [];
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    if (!value) continue;
    chunks.push(value);
    if (contentLength > 0) {
      receivedLength += value.length;
      onProgress(receivedLength / contentLength);
    }
  }

  const blob = new Blob(chunks);

  return await blob.arrayBuffer();
}

export const FirmwareChannels = ['stable', 'beta', 'develop'] as const;
export type FirmwareChannel = (typeof FirmwareChannels)[number];

export async function FetchChannelVersion(channel: FirmwareChannel) {
  return (await DownloadText(`https://firmware.openshock.org/version-${channel}.txt`))?.trim();
}

export function FetchChannelBoards(version: string) {
  return DownloadLines(`https://firmware.openshock.org/${version}/boards.txt`);
}

export function DownloadFirmwareBinary(
  version: string,
  board: string,
  onProgress: (percent: number) => void
) {
  return DownloadBinary(
    `https://firmware.openshock.org/${version}/${board}/firmware.bin`,
    onProgress
  );
}

export async function GetFirmwareBinaryHash(version: string, board: string) {
  const lines = await DownloadLines(
    `https://firmware.openshock.org/${version}/${board}/hashes.md5.txt`
  );
  if (!lines) return null;

  const hashLine = lines.find((x) => x.endsWith('firmware.bin'));
  if (!hashLine) return null;

  const hash = hashLine.split(' ')[0].trim();

  // Validate hash length
  if (hash.length != 32) return null;

  return hash;
}

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  DownloadAndVerifyBoardBinary,
  FetchChannelVersion,
  FetchVersionBoards,
  GetBoardBinaryHash,
  GetBoardBinaryHashes,
} from './firmwareCDN';

// Mock the crypto util so hash verification is controllable in tests
vi.mock('$lib/utils/crypto', () => ({
  HashBuffer: vi.fn(),
  HashString: vi.fn(),
}));

import { HashBuffer } from '$lib/utils/crypto';

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn());
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

function textResponse(body: string, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? 'OK' : 'Not Found',
    text: vi.fn().mockResolvedValue(body),
    bytes: vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3])),
  } as unknown as Response;
}

function binaryResponse(bytes: Uint8Array, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? 'OK' : 'Not Found',
    text: vi.fn(),
    bytes: vi.fn().mockResolvedValue(bytes),
  } as unknown as Response;
}

// ---------------------------------------------------------------------------
// FetchChannelVersion
// ---------------------------------------------------------------------------

describe('FetchChannelVersion', () => {
  it('returns trimmed version string', async () => {
    vi.mocked(fetch).mockResolvedValue(textResponse('  1.2.3  '));
    const version = await FetchChannelVersion('stable');
    expect(version).toBe('1.2.3');
  });

  it('fetches from the correct URL', async () => {
    vi.mocked(fetch).mockResolvedValue(textResponse('1.0.0'));
    await FetchChannelVersion('beta');
    expect(vi.mocked(fetch).mock.calls[0][0]).toContain('version-beta.txt');
  });

  it('throws when fetch returns non-ok status', async () => {
    vi.mocked(fetch).mockResolvedValue(textResponse('', 404));
    await expect(FetchChannelVersion('develop')).rejects.toThrow('404');
  });
});

// ---------------------------------------------------------------------------
// FetchVersionBoards
// ---------------------------------------------------------------------------

describe('FetchVersionBoards', () => {
  it('returns array of trimmed board names', async () => {
    vi.mocked(fetch).mockResolvedValue(textResponse('board-A\n  board-B  \nboard-C'));
    const boards = await FetchVersionBoards('1.0.0');
    expect(boards).toEqual(['board-A', 'board-B', 'board-C']);
  });

  it('fetches from the correct URL', async () => {
    vi.mocked(fetch).mockResolvedValue(textResponse('board-A'));
    await FetchVersionBoards('2.0.0');
    expect(vi.mocked(fetch).mock.calls[0][0]).toContain('2.0.0/boards.txt');
  });
});

// ---------------------------------------------------------------------------
// GetBoardBinaryHashes
// ---------------------------------------------------------------------------

describe('GetBoardBinaryHashes', () => {
  it('parses sha256 hash file into a map', async () => {
    const hashContent = [
      'a'.repeat(64) + ' ./firmware.bin',
      'b'.repeat(64) + ' ./bootloader.bin',
    ].join('\n');
    vi.mocked(fetch).mockResolvedValue(textResponse(hashContent));

    const hashes = await GetBoardBinaryHashes('1.0.0', 'esp32', 'sha256');
    expect(hashes['firmware.bin']).toBe('a'.repeat(64));
    expect(hashes['bootloader.bin']).toBe('b'.repeat(64));
  });

  it('strips leading "./" from filenames', async () => {
    vi.mocked(fetch).mockResolvedValue(
      textResponse('a'.repeat(64) + ' ./firmware.bin'),
    );
    const hashes = await GetBoardBinaryHashes('1.0.0', 'esp32', 'sha256');
    expect('firmware.bin' in hashes).toBe(true);
    expect('./firmware.bin' in hashes).toBe(false);
  });

  it('parses md5 hash file (32-char hashes)', async () => {
    vi.mocked(fetch).mockResolvedValue(
      textResponse('f'.repeat(32) + ' firmware.bin'),
    );
    const hashes = await GetBoardBinaryHashes('1.0.0', 'esp32', 'md5');
    expect(hashes['firmware.bin']).toBe('f'.repeat(32));
  });

  it('throws for a line with no filename', async () => {
    vi.mocked(fetch).mockResolvedValue(textResponse('a'.repeat(64)));
    await expect(GetBoardBinaryHashes('1.0.0', 'esp32', 'sha256')).rejects.toThrow(
      'Invalid hash line',
    );
  });

  it('throws for a hash with wrong length', async () => {
    vi.mocked(fetch).mockResolvedValue(textResponse('abc firmware.bin'));
    await expect(GetBoardBinaryHashes('1.0.0', 'esp32', 'sha256')).rejects.toThrow(
      'Invalid hash length',
    );
  });

  it('throws for a hash with invalid characters', async () => {
    vi.mocked(fetch).mockResolvedValue(
      textResponse('Z'.repeat(64) + ' firmware.bin'),
    );
    await expect(GetBoardBinaryHashes('1.0.0', 'esp32', 'sha256')).rejects.toThrow(
      'Invalid hash format',
    );
  });
});

// ---------------------------------------------------------------------------
// GetBoardBinaryHash
// ---------------------------------------------------------------------------

describe('GetBoardBinaryHash', () => {
  it('returns the hash for a known filename', async () => {
    const expected = 'a'.repeat(64);
    vi.mocked(fetch).mockResolvedValue(
      textResponse(`${expected} firmware.bin`),
    );
    const hash = await GetBoardBinaryHash('1.0.0', 'esp32', 'firmware.bin', 'sha256');
    expect(hash).toBe(expected);
  });

  it('returns null for unknown filename', async () => {
    vi.mocked(fetch).mockResolvedValue(
      textResponse('a'.repeat(64) + ' other.bin'),
    );
    const hash = await GetBoardBinaryHash('1.0.0', 'esp32', 'missing.bin', 'sha256');
    expect(hash).toBeNull();
  });

  it('strips "./" prefix from filename before lookup', async () => {
    const expected = 'b'.repeat(64);
    vi.mocked(fetch).mockResolvedValue(
      textResponse(`${expected} firmware.bin`),
    );
    const hash = await GetBoardBinaryHash('1.0.0', 'esp32', './firmware.bin', 'sha256');
    expect(hash).toBe(expected);
  });
});

// ---------------------------------------------------------------------------
// DownloadAndVerifyBoardBinary
// ---------------------------------------------------------------------------

describe('DownloadAndVerifyBoardBinary', () => {
  it('returns binary when hash matches', async () => {
    const expectedHash = 'a'.repeat(64);
    const binary = new Uint8Array([0xde, 0xad, 0xbe, 0xef]);

    vi.mocked(fetch)
      .mockResolvedValueOnce(binaryResponse(binary))
      .mockResolvedValueOnce(textResponse(`${expectedHash} firmware.bin`));
    vi.mocked(HashBuffer).mockResolvedValue(expectedHash);

    const result = await DownloadAndVerifyBoardBinary('1.0.0', 'esp32', 'firmware.bin');
    expect(result).toEqual(binary);
  });

  it('throws when calculated hash does not match', async () => {
    const storedHash = 'a'.repeat(64);
    const calculatedHash = 'b'.repeat(64);
    const binary = new Uint8Array([1, 2, 3]);

    vi.mocked(fetch)
      .mockResolvedValueOnce(binaryResponse(binary))
      .mockResolvedValueOnce(textResponse(`${storedHash} firmware.bin`));
    vi.mocked(HashBuffer).mockResolvedValue(calculatedHash);

    await expect(
      DownloadAndVerifyBoardBinary('1.0.0', 'esp32', 'firmware.bin'),
    ).rejects.toThrow('Hash mismatch');
  });

  it('throws when no hash entry found for the filename', async () => {
    const binary = new Uint8Array([1]);

    vi.mocked(fetch)
      .mockResolvedValueOnce(binaryResponse(binary))
      .mockResolvedValueOnce(textResponse('a'.repeat(64) + ' other.bin'));

    await expect(
      DownloadAndVerifyBoardBinary('1.0.0', 'esp32', 'firmware.bin'),
    ).rejects.toThrow('No hash found');
  });
});

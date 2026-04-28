import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { checkPwnedCount } from './pwnedPasswords';

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn());
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function makeTextResponse(text: string, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    text: vi.fn().mockResolvedValue(text),
  } as unknown as Response;
}

describe('checkPwnedCount', () => {
  it('throws for empty password', async () => {
    await expect(checkPwnedCount('')).rejects.toThrow('Password cannot be empty');
  });

  it('returns 0 when password hash suffix is not in the response', async () => {
    vi.mocked(fetch).mockResolvedValue(makeTextResponse('AABBCC:3\nDDEEFF:1'));
    const count = await checkPwnedCount('not-pwned-password');
    expect(count).toBe(0);
  });

  it('returns the breach count when hash suffix matches', async () => {
    // SHA-1 of "password" = 5BAA61E4C9B93F3F0682250B6CF8331B7EE68FD8
    // Prefix: 5BAA6, suffix: 1E4C9B93F3F0682250B6CF8331B7EE68FD8
    const suffix = '1E4C9B93F3F0682250B6CF8331B7EE68FD8';
    vi.mocked(fetch).mockResolvedValue(makeTextResponse(`AAAAA:5\n${suffix}:9999\nBBBBB:1`));
    const count = await checkPwnedCount('password');
    expect(count).toBe(9999);
  });

  it('sends request to the correct HIBP range endpoint', async () => {
    vi.mocked(fetch).mockResolvedValue(makeTextResponse(''));
    await checkPwnedCount('password');
    const url = vi.mocked(fetch).mock.calls[0][0] as string;
    expect(url).toMatch(/^https:\/\/api\.pwnedpasswords\.com\/range\/[A-Fa-f0-9]{5}$/);
  });

  it('uses the first 5 chars of the SHA-1 hash as the prefix', async () => {
    vi.mocked(fetch).mockResolvedValue(makeTextResponse(''));
    await checkPwnedCount('password');
    const url = vi.mocked(fetch).mock.calls[0][0] as string;
    // SHA-1("password") = 5baa61e4c9b93f3f... → prefix is '5baa6' (lowercase)
    expect(url.endsWith('5baa6')).toBe(true);
  });

  it('throws when fetch rejects (network error)', async () => {
    vi.mocked(fetch).mockRejectedValue(new Error('Network failure'));
    await expect(checkPwnedCount('mypassword')).rejects.toThrow(
      'Error while fetching pwned passwords range',
    );
  });

  it('returns 0 for non-empty password with no pwned matches', async () => {
    vi.mocked(fetch).mockResolvedValue(makeTextResponse('AAAAA:1\nBBBBB:2'));
    const count = await checkPwnedCount('verylongandunlikelypwned42');
    expect(count).toBe(0);
  });
});

import { describe, expect, it } from 'vitest';
import { md5 } from './md5';

function fromString(s: string): Uint8Array {
  return new TextEncoder().encode(s);
}

describe('md5', () => {
  it('hashes an empty input', () => {
    expect(md5(new Uint8Array([]))).toBe('d41d8cd98f00b204e9800998ecf8427e');
  });

  it('hashes "hello"', () => {
    expect(md5(fromString('hello'))).toBe('5d41402abc4b2a76b9719d911017c592');
  });

  it('hashes "abc"', () => {
    expect(md5(fromString('abc'))).toBe('900150983cd24fb0d6963f7d28e17f72');
  });

  it('hashes a string exactly 55 bytes (just fits in one block with padding)', () => {
    const input = 'a'.repeat(55);
    expect(md5(fromString(input))).toBe('ef1772b6dff9a122358552954ad0df65');
  });

  it('hashes a string of 56 bytes (forces a second block for padding)', () => {
    const input = 'a'.repeat(56);
    expect(md5(fromString(input))).toBe('3b0c8ac703f828b04c6c197006d17218');
  });

  it('hashes a string exactly 64 bytes (one full block)', () => {
    const input = 'a'.repeat(64);
    expect(md5(fromString(input))).toBe('014842d480b571495a4a0363793f7367');
  });

  it('hashes arbitrary binary data', () => {
    const data = new Uint8Array([0xde, 0xad, 0xbe, 0xef]);
    expect(md5(data)).toBe('2f249230a8e7c2bf6005ccd2679259ec');
  });

  it('hashes a longer message spanning multiple blocks', () => {
    const input = 'The quick brown fox jumps over the lazy dog';
    expect(md5(fromString(input))).toBe('9e107d9d372bb6826bd81d3542a419d6');
  });
});

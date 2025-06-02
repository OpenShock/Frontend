import { EncodeString } from './encoding';

export const ArrayBufferToHex = (buffer: ArrayBuffer) =>
  Array.from(new Uint8Array(buffer))
    .map((num) => num.toString(16).padStart(2, '0'))
    .join('');

export async function HashBuffer(
  input: BufferSource,
  hashtype: 'SHA-1' | 'SHA-256'
): Promise<string> {
  const hashBuffer = await crypto.subtle.digest(hashtype, input);
  return ArrayBufferToHex(hashBuffer);
}
export async function HashString(input: string, hashtype: 'SHA-1' | 'SHA-256') {
  return HashBuffer(EncodeString(input), hashtype);
}

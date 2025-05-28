const EncodeString = (input: string) => new TextEncoder().encode(input);
const ArrayBufferToHex = (buffer: ArrayBuffer) => Array.from(new Uint8Array(buffer)).map((b) => b.toString(16).padStart(2, '0')).join('');

export async function HashString(input: string, hashtype: 'SHA-1' | 'SHA-256'): Promise<string> {
  const data = EncodeString(input);
  const hashBuffer = await crypto.subtle.digest(hashtype, data);
  return ArrayBufferToHex(hashBuffer);
}

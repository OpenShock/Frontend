export function escapeHtml(unsafe: string | null): string {
  if (unsafe === null) return 'null';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export const EncodeString = (input: string) => new TextEncoder().encode(input);
export const DecodeString = (input: Uint8Array) => new TextDecoder().decode(input);

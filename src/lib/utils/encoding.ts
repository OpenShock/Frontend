export function escapeHtml(unsafe: string | null): string {
  if (unsafe === null) return 'null';
  return unsafe
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

export const EncodeString = (input: string) => new TextEncoder().encode(input);
export const DecodeString = (input: Uint8Array) => new TextDecoder().decode(input);

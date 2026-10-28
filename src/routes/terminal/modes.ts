/** URL and internal mode values. 'raw' is the bare console; the UI calls it Serial Monitor. */
export type Mode = 'flash' | 'configure' | 'raw';
export const MODES: Mode[] = ['configure', 'flash', 'raw'];

export function isMode(value: string | null): value is Mode {
  return value !== null && (MODES as string[]).includes(value);
}

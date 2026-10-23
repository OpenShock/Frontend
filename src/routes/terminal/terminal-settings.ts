import { COLOR_KEYS, DEFAULT_SETTINGS, HEX_COLOR, TIMESTAMP_MODES } from './constants';
import type { ColorKey, Palette, StoredSettings, TimestampMode } from './types';

/** Validates untrusted settings data field by field, falling back to defaults. */
export function parseStoredSettings(input: unknown): StoredSettings {
  const p = (input && typeof input === 'object' ? input : {}) as Partial<StoredSettings>;
  const colors: Partial<Palette> = {};
  if (p.colors && typeof p.colors === 'object') {
    for (const key of COLOR_KEYS) {
      const v = p.colors[key];
      if (typeof v === 'string' && HEX_COLOR.test(v)) colors[key] = v.toLowerCase();
    }
  }
  return {
    timestampMode: TIMESTAMP_MODES.includes(p.timestampMode as TimestampMode)
      ? (p.timestampMode as TimestampMode)
      : DEFAULT_SETTINGS.timestampMode,
    rawMode: typeof p.rawMode === 'boolean' ? p.rawMode : DEFAULT_SETTINGS.rawMode,
    hideSystem: typeof p.hideSystem === 'boolean' ? p.hideSystem : DEFAULT_SETTINGS.hideSystem,
    stickToBottom:
      typeof p.stickToBottom === 'boolean' ? p.stickToBottom : DEFAULT_SETTINGS.stickToBottom,
    colors,
  };
}

/** Version tag so future share-string format changes can be told apart. */
const EXPORT_VERSION = 1;

/**
 * Compact share format: one-letter keys, one-letter timestamp codes, booleans as 1/0,
 * hex colors without '#', greys shortened to 2 digits.
 * { v, t, r, h, s, c } = version, timestamps, raw, hide system, stick to bottom, colors.
 */
interface CompactSettings {
  v: number;
  t: string;
  r: 0 | 1;
  h: 0 | 1;
  s: 0 | 1;
  c: Partial<Record<ColorKey, string>>;
}

/** Greys ("aaaaaa") shrink to one channel ("aa"); any other color stays 6 digits. */
function shortenHex(hex: string): string {
  const r = hex.slice(0, 2);
  return hex.slice(2, 4) === r && hex.slice(4, 6) === r ? r : hex;
}

/** Accepts 2 (grey) or 6 hex digits; returns 6 hex digits, or null if neither. */
function expandHex(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  if (/^[0-9a-f]{6}$/i.test(value)) return value;
  if (/^[0-9a-f]{2}$/i.test(value)) return value.repeat(3);
  return null;
}

function toBit(value: boolean): 0 | 1 {
  return value ? 1 : 0;
}

function fromBit(value: unknown): boolean | undefined {
  if (value === 1 || value === true) return true;
  if (value === 0 || value === false) return false;
  return undefined;
}

const TIMESTAMP_CODES: Record<TimestampMode, string> = {
  uptime: 'u',
  local: 'l',
  ms: 'm',
  off: 'o',
};
const TIMESTAMP_FROM_CODE: Record<string, TimestampMode> = {
  u: 'uptime',
  l: 'local',
  m: 'ms',
  o: 'off',
};

/** Serializes settings as the compact share string. */
export function encodeShareString(s: StoredSettings): string {
  const c: Partial<Record<ColorKey, string>> = {};
  for (const key of COLOR_KEYS) {
    const v = s.colors[key];
    if (v) c[key] = shortenHex(v.slice(1));
  }
  const compact: CompactSettings = {
    v: EXPORT_VERSION,
    t: TIMESTAMP_CODES[s.timestampMode],
    r: toBit(s.rawMode),
    h: toBit(s.hideSystem),
    s: toBit(s.stickToBottom),
    c,
  };
  return JSON.stringify(compact);
}

/** Parses a share string. Returns null if it is not JSON; invalid fields fall back to defaults. */
export function decodeShareString(text: string): StoredSettings | null {
  let data: unknown;
  try {
    data = JSON.parse(text.trim());
  } catch {
    return null;
  }
  if (!data || typeof data !== 'object') return null;
  const p = data as Partial<CompactSettings>;
  const colors: Partial<Palette> = {};
  if (p.c && typeof p.c === 'object') {
    for (const key of COLOR_KEYS) {
      const hex = expandHex(p.c[key]);
      if (hex) colors[key] = `#${hex}`;
    }
  }
  return parseStoredSettings({
    timestampMode: typeof p.t === 'string' ? TIMESTAMP_FROM_CODE[p.t] : undefined,
    rawMode: fromBit(p.r),
    hideSystem: fromBit(p.h),
    stickToBottom: fromBit(p.s),
    colors,
  });
}

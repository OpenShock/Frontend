import { m } from '#lib/paraglide/messages.js';
import type { ColorKey, Palette, StoredSettings, TimestampMode } from './types';

/** Maximum number of terminal lines to keep in memory. */
export const MAX_LINES = 5000;

export const TIMESTAMP_MODES: TimestampMode[] = ['uptime', 'local', 'ms', 'off'];
export const TIMESTAMP_LABELS: Record<TimestampMode, () => string> = {
  uptime: m.terminal_timestamp_uptime,
  local: m.terminal_timestamp_local,
  ms: m.terminal_timestamp_ms,
  off: m.terminal_timestamp_off,
};

export const COLOR_KEYS: ColorKey[] = ['bg', 'fg', 'ts', 'E', 'W', 'I', 'D', 'V'];
export const COLOR_LABELS: Record<ColorKey, () => string> = {
  bg: m.terminal_color_bg,
  fg: m.terminal_color_fg,
  ts: m.terminal_color_ts,
  E: m.terminal_color_error,
  W: m.terminal_color_warning,
  I: m.terminal_color_info,
  D: m.terminal_color_debug,
  V: m.terminal_color_verbose,
};

/** Six-digit hex color with leading '#'. */
export const HEX_COLOR = /^#[0-9a-f]{6}$/i;

export const DEFAULT_SETTINGS: StoredSettings = {
  timestampMode: 'uptime',
  rawMode: false,
  hideSystem: true,
  stickToBottom: true,
  colors: {},
};

/** Default console colors on a dark site theme. */
export const DARK_PALETTE: Palette = {
  bg: '#000000',
  fg: '#e5e5e5',
  ts: '#737373',
  E: '#ff4444',
  W: '#ffaa00',
  I: '#51cf66',
  D: '#74c0fc',
  V: '#808080',
};

/** Default console colors on a light site theme. */
export const LIGHT_PALETTE: Palette = {
  bg: '#f5f5f5',
  fg: '#171717',
  ts: '#737373',
  E: '#dc2626',
  W: '#d97706',
  I: '#16a34a',
  D: '#2563eb',
  V: '#6b7280',
};

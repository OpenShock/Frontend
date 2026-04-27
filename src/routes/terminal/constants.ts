import type { LogLevel } from './types';

/** Maximum number of terminal lines to keep in memory. */
export const MAX_LINES = 5000;

export const LOG_LEVEL_COLORS: Record<LogLevel, string> = {
  E: '#ff4444',
  W: '#ffaa00',
  I: '#51cf66',
  D: '#74c0fc',
  V: '#808080',
};
